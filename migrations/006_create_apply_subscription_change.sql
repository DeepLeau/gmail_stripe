-- RPC pour appliquer les changements d'abonnement depuis les webhooks Stripe
-- SECURITY DEFINER car appelé par webhook (service_role) mais vérifie auth.uid() quand même
CREATE OR REPLACE FUNCTION public.apply_subscription_change(
  p_user_id uuid,
  p_plan text,
  p_stripe_customer_id text,
  p_stripe_subscription_id text,
  p_stripe_session_id text,
  p_current_period_start timestamptz,
  p_current_period_end timestamptz,
  p_subscription_status text DEFAULT 'active'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_messages_limit integer;
  v_existing_user_id uuid;
  v_result jsonb;
BEGIN
  -- Mapping plan → messages_limit
  v_messages_limit := CASE p_plan
    WHEN 'start' THEN 10
    WHEN 'scale' THEN 50
    WHEN 'team' THEN 100
    ELSE 0
  END;

  -- Validation du plan
  IF p_plan NOT IN ('start', 'scale', 'team') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid plan: ' || p_plan);
  END IF;

  -- Vérification auth (doit être service_role qui bypass RLS)
  IF auth.uid() IS NULL THEN
    -- En contexte webhook, auth.uid() peut être NULL selon config
    -- On vérifie via current_setting si c'est bien un appel service_role
    IF current_setting('request.jwt.claim.role', true) != 'service_role' THEN
      RETURN jsonb_build_object('success', false, 'error', 'Service role required');
    END IF;
  END IF;

  -- Upsert via stripe_session_id (cas checkout post-signup)
  IF p_stripe_session_id IS NOT NULL THEN
    INSERT INTO public.user_subscriptions (
      user_id, plan, stripe_customer_id, stripe_subscription_id, stripe_session_id,
      messages_limit, messages_used, current_period_start, current_period_end,
      subscription_status, created_by, updated_by
    )
    VALUES (
      p_user_id, p_plan, p_stripe_customer_id, p_stripe_subscription_id, p_stripe_session_id,
      v_messages_limit, 0, p_current_period_start, p_current_period_end,
      p_subscription_status, auth.uid(), auth.uid()
    )
    ON CONFLICT (stripe_session_id) WHERE stripe_session_id IS NOT NULL
    DO UPDATE SET
      user_id = COALESCE($1, user_subscriptions.user_id),  -- Ne jamais écraser un user_id existant
      plan = EXCLUDED.plan,
      stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, user_subscriptions.stripe_customer_id),
      stripe_subscription_id = COALESCE(EXCLUDED.stripe_subscription_id, user_subscriptions.stripe_subscription_id),
      messages_limit = EXCLUDED.messages_limit,
      messages_used = 0,  -- Reset au renouvellement
      current_period_start = EXCLUDED.current_period_start,
      current_period_end = EXCLUDED.current_period_end,
      subscription_status = EXCLUDED.subscription_status,
      updated_at = now(),
      updated_by = auth.uid()
    RETURNING to_jsonb(user_subscriptions.*) INTO v_result;

    RETURN jsonb_build_object('success', true, 'data', v_result);
  END IF;

  -- Upsert via stripe_customer_id (cas webhook renewal ou pre-signup)
  IF p_stripe_customer_id IS NOT NULL THEN
    INSERT INTO public.user_subscriptions (
      user_id, plan, stripe_customer_id, stripe_subscription_id,
      messages_limit, messages_used, current_period_start, current_period_end,
      subscription_status, created_by, updated_by
    )
    VALUES (
      p_user_id, p_plan, p_stripe_customer_id, p_stripe_subscription_id,
      v_messages_limit, 0, p_current_period_start, p_current_period_end,
      p_subscription_status, auth.uid(), auth.uid()
    )
    ON CONFLICT (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL
    DO UPDATE SET
      user_id = COALESCE($1, user_subscriptions.user_id),
      plan = EXCLUDED.plan,
      stripe_subscription_id = COALESCE(EXCLUDED.stripe_subscription_id, user_subscriptions.stripe_subscription_id),
      messages_limit = EXCLUDED.messages_limit,
      messages_used = 0,  -- Reset au renouvellement
      current_period_start = EXCLUDED.current_period_start,
      current_period_end = EXCLUDED.current_period_end,
      subscription_status = EXCLUDED.subscription_status,
      updated_at = now(),
      updated_by = auth.uid()
    RETURNING to_jsonb(user_subscriptions.*) INTO v_result;

    RETURN jsonb_build_object('success', true, 'data', v_result);
  END IF;

  -- Upsert via stripe_subscription_id (fallback)
  -- Garde: stripe_subscription_id seul sans user_id crée une ligne orpheline irrécupérable
  IF p_stripe_subscription_id IS NOT NULL THEN
    IF p_user_id IS NULL THEN
      RETURN jsonb_build_object('success', false, 'error', 'user_id required when upserting by stripe_subscription_id');
    END IF;

    INSERT INTO public.user_subscriptions (
      user_id, plan, stripe_subscription_id,
      messages_limit, messages_used, current_period_start, current_period_end,
      subscription_status, created_by, updated_by
    )
    VALUES (
      p_user_id, p_plan, p_stripe_subscription_id,
      v_messages_limit, 0, p_current_period_start, p_current_period_end,
      p_subscription_status, auth.uid(), auth.uid()
    )
    ON CONFLICT (stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL
    DO UPDATE SET
      user_id = COALESCE($1, user_subscriptions.user_id),
      plan = EXCLUDED.plan,
      messages_limit = EXCLUDED.messages_limit,
      messages_used = 0,
      current_period_start = EXCLUDED.current_period_start,
      current_period_end = EXCLUDED.current_period_end,
      subscription_status = EXCLUDED.subscription_status,
      updated_at = now(),
      updated_by = auth.uid()
    RETURNING to_jsonb(user_subscriptions.*) INTO v_result;

    RETURN jsonb_build_object('success', true, 'data', v_result);
  END IF;

  -- Si user_id fourni directement (cas simple)
  IF p_user_id IS NOT NULL THEN
    INSERT INTO public.user_subscriptions (
      user_id, plan, messages_limit, messages_used,
      current_period_start, current_period_end, subscription_status,
      created_by, updated_by
    )
    VALUES (
      p_user_id, p_plan, v_messages_limit, 0,
      p_current_period_start, p_current_period_end, p_subscription_status,
      auth.uid(), auth.uid()
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
      plan = EXCLUDED.plan,
      messages_limit = EXCLUDED.messages_limit,
      messages_used = 0,
      current_period_start = EXCLUDED.current_period_start,
      current_period_end = EXCLUDED.current_period_end,
      subscription_status = EXCLUDED.subscription_status,
      updated_at = now(),
      updated_by = auth.uid()
    RETURNING to_jsonb(user_subscriptions.*) INTO v_result;

    RETURN jsonb_build_object('success', true, 'data', v_result);
  END IF;

  RETURN jsonb_build_object('success', false, 'error', 'No identifier provided');

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant EXECUTE uniquement au service_role (webhooks)
GRANT EXECUTE ON FUNCTION public.apply_subscription_change(
  uuid, text, text, text, text, timestamptz, timestamptz, text
) TO service_role;
