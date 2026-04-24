-- =============================================================================
-- MIGRATION 003: Fonction RPC d'upsert pour les webhooks Stripe
-- Crée ou met à jour un abonnement selon stripe_customer_id ou stripe_session_id
-- =============================================================================

CREATE OR REPLACE FUNCTION public.apply_subscription_change(
  p_stripe_customer_id text,
  p_stripe_session_id text,
  p_plan text,
  p_messages_limit integer,
  p_stripe_subscription_id text DEFAULT NULL,
  p_current_period_start timestamptz DEFAULT NULL,
  p_current_period_end timestamptz DEFAULT NULL,
  p_status text DEFAULT 'active',
  p_messages_used_to_reset integer DEFAULT NULL  -- si fourni, remet messages_used à cette valeur (reset mensuel)
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_existing_user_id uuid;
  v_existing_record boolean := false;
  v_result jsonb;
BEGIN
  -- Validation des paramètres obligatoires
  IF p_stripe_customer_id IS NULL AND p_stripe_session_id IS NULL THEN
    RAISE EXCEPTION 'At least stripe_customer_id or stripe_session_id is required';
  END IF;

  -- Valider le plan
  IF p_plan NOT IN ('start', 'scale', 'team') THEN
    RAISE EXCEPTION 'Invalid plan: %', p_plan;
  END IF;

  -- Valider le statut
  IF p_status NOT IN ('inactive', 'active', 'trialing', 'past_due', 'canceled', 'unpaid') THEN
    RAISE EXCEPTION 'Invalid subscription_status: %', p_status;
  END IF;

  -- Chercher un enregistrement existant par stripe_customer_id
  IF p_stripe_customer_id IS NOT NULL THEN
    SELECT user_id INTO v_existing_user_id
    FROM public.user_subscriptions
    WHERE stripe_customer_id = p_stripe_customer_id
    LIMIT 1;
    
    IF v_existing_user_id IS NOT NULL THEN
      v_existing_record := true;
    END IF;
  END IF;

  -- Si pas trouvé par customer_id, chercher par session_id
  IF NOT v_existing_record AND p_stripe_session_id IS NOT NULL THEN
    SELECT user_id INTO v_existing_user_id
    FROM public.user_subscriptions
    WHERE stripe_session_id = p_stripe_session_id
    LIMIT 1;
    
    IF v_existing_user_id IS NOT NULL THEN
      v_existing_record := true;
    END IF;
  END IF;

  -- UPSERT : insert ou update selon l'enregistrement trouvé
  IF v_existing_record THEN
    -- UPDATE : l'utilisateur existe déjà (signup déjà fait ou pré-signup lié)
    UPDATE public.user_subscriptions
    SET 
      stripe_customer_id = COALESCE(p_stripe_customer_id, stripe_customer_id),
      stripe_subscription_id = COALESCE(p_stripe_subscription_id, stripe_subscription_id),
      plan = p_plan,
      messages_limit = p_messages_limit,
      messages_used = COALESCE(p_messages_used_to_reset, messages_used),  -- reset si fourni, sinon garder
      current_period_start = COALESCE(p_current_period_start, current_period_start),
      current_period_end = COALESCE(p_current_period_end, current_period_end),
      subscription_status = p_status,
      updated_at = now()
    WHERE user_id = v_existing_user_id
    RETURNING jsonb_build_object(
      'action', 'updated',
      'user_id', user_id,
      'plan', plan,
      'messages_limit', messages_limit,
      'messages_used', messages_used,
      'subscription_status', subscription_status
    ) INTO v_result;
  ELSE
    -- INSERT : nouvel enregistrement (cas pré-signup ou changement de customer_id)
    -- user_id sera NULL pour le moment, à linker post-signup via linkStripeSessionToUser
    INSERT INTO public.user_subscriptions (
      stripe_customer_id,
      stripe_session_id,
      plan,
      messages_limit,
      messages_used,
      stripe_subscription_id,
      current_period_start,
      current_period_end,
      subscription_status
    )
    VALUES (
      p_stripe_customer_id,
      p_stripe_session_id,
      p_plan,
      p_messages_limit,
      COALESCE(p_messages_used_to_reset, 0),
      p_stripe_subscription_id,
      p_current_period_start,
      p_current_period_end,
      p_status
    )
    ON CONFLICT (stripe_customer_id) DO UPDATE SET
      stripe_subscription_id = COALESCE(p_stripe_subscription_id, user_subscriptions.stripe_subscription_id),
      plan = p_plan,
      messages_limit = p_messages_limit,
      messages_used = COALESCE(p_messages_used_to_reset, user_subscriptions.messages_used),
      current_period_start = COALESCE(p_current_period_start, user_subscriptions.current_period_start),
      current_period_end = COALESCE(p_current_period_end, user_subscriptions.current_period_end),
      subscription_status = p_status,
      updated_at = now()
    RETURNING jsonb_build_object(
      'action', CASE WHEN stripe_customer_id IS NOT NULL THEN 'updated' ELSE 'inserted' END,
      'user_id', user_id,
      'stripe_customer_id', stripe_customer_id,
      'plan', plan,
      'messages_limit', messages_limit,
      'messages_used', messages_used,
      'subscription_status', subscription_status
    ) INTO v_result;
  END IF;

  RETURN v_result;

EXCEPTION
  WHEN others THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to apply subscription change'
    );
END;
$$;

-- GrantEXECUTE au service_role (webhooks) et authenticated (pour linkStripeSessionToUser)
GRANT EXECUTE ON FUNCTION public.apply_subscription_change(
  text, text, text, integer, text, timestamptz, timestamptz, text, integer
) TO authenticated;
GRANT EXECUTE ON FUNCTION public.apply_subscription_change(
  text, text, text, integer, text, timestamptz, timestamptz, text, integer
) TO service_role;

REVOKE EXECUTE ON FUNCTION public.apply_subscription_change(
  text, text, text, integer, text, timestamptz, timestamptz, text, integer
) FROM PUBLIC;
