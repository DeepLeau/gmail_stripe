-- ============================================================
-- Migration 004: Fonctions RPC pour le decrement et l'upsert
-- 
-- Ces fonctions sont appelées par le service_role via les Server
-- Actions et les handlers de webhooks Stripe.
-- ============================================================

-- ============================================================
-- Fonction: decrement_message_count
-- Usage: Appelée avant chaque envoi de message dans le chat
-- Atomique: UPDATE avec WHERE clause + RETURNING
-- Retourne: { success: boolean, remaining: integer }
-- ============================================================

CREATE OR REPLACE FUNCTION public.decrement_message_count(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_remaining integer;
  v_current_used integer;
BEGIN
  -- Validation: user_id requis
  IF p_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'user_id_required');
  END IF;

  -- Update atomique: decremente messages_used SEULEMENT si messages_used < messages_limit
  -- Le RETURNING permet d'avoir la valeur avant ou après selon la condition
  UPDATE public.user_subscriptions
  SET 
    messages_used = messages_used + 1,
    updated_at = now()
  WHERE 
    user_id = p_user_id
    AND messages_used < messages_limit
    AND subscription_status IN ('active', 'trialing')
  RETURNING messages_used, messages_limit
  INTO v_current_used, v_remaining;

  -- Si aucune ligne n'a été modifiée (quota atteint ou subscription inactive)
  IF v_remaining IS NULL THEN
    -- On vérifie l'état actuel pour retourner le bon message
    SELECT messages_used, messages_limit, subscription_status
    INTO v_current_used, v_remaining, v_remaining
    FROM public.user_subscriptions
    WHERE user_id = p_user_id;

    IF v_remaining IS NULL THEN
      RETURN jsonb_build_object(
        'success', false, 
        'error', 'no_subscription',
        'remaining', 0
      );
    END IF;

    RETURN jsonb_build_object(
      'success', false,
      'error', 'quota_exceeded',
      'remaining', v_remaining - v_current_used
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'remaining', v_remaining - v_current_used
  );
END;
$$;

COMMENT ON FUNCTION public.decrement_message_count(uuid) IS 
  'Décrémente atomiquement le compteur de messages pour un utilisateur.
   Retourne { success, remaining } ou { success: false, error, remaining }.
   L''atomicité est garantie par UPDATE ... WHERE RETURNING.
   Refuse si quota atteint ou subscription inactive.';


-- ============================================================
-- Fonction: apply_subscription_change
-- Usage: Handler webhook Stripe (checkout.session.completed, 
--        customer.subscription.updated, customer.subscription.deleted)
-- Idempotent: UPSERT sur session_id OU stripe_customer_id
-- ============================================================

CREATE OR REPLACE FUNCTION public.apply_subscription_change(
  p_stripe_session_id text,
  p_stripe_customer_id text,
  p_stripe_subscription_id text,
  p_plan text,
  p_messages_limit integer,
  p_current_period_start timestamptz,
  p_current_period_end timestamptz,
  p_status text
)
RETURNS public.user_subscriptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_result public.user_subscriptions;
  v_existing_id uuid;
BEGIN
  -- Validation des paramètres
  IF p_stripe_session_id IS NULL AND p_stripe_customer_id IS NULL THEN
    RAISE EXCEPTION 'At least stripe_session_id or stripe_customer_id is required';
  END IF;

  -- Validation du plan
  IF p_plan NOT IN ('start', 'scale', 'team') THEN
    RAISE EXCEPTION 'Invalid plan: %', p_plan;
  END IF;

  -- Validation du status
  IF p_status NOT IN ('incomplete', 'active', 'past_due', 'canceled', 'trialing', 'unpaid') THEN
    RAISE EXCEPTION 'Invalid status: %', p_status;
  END IF;

  -- Cherche un enregistrement existant par session_id ou customer_id
  SELECT id INTO v_existing_id
  FROM public.user_subscriptions
  WHERE 
    (p_stripe_session_id IS NOT NULL AND stripe_session_id = p_stripe_session_id)
    OR (p_stripe_customer_id IS NOT NULL AND stripe_customer_id = p_stripe_customer_id);

  -- Upsert: insert ou update selon existence
  IF v_existing_id IS NOT NULL THEN
    -- Update de l'existant
    UPDATE public.user_subscriptions
    SET
      stripe_customer_id = COALESCE(p_stripe_customer_id, stripe_customer_id),
      stripe_subscription_id = COALESCE(p_stripe_subscription_id, stripe_subscription_id),
      stripe_session_id = COALESCE(p_stripe_session_id, stripe_session_id),
      plan = p_plan,
      messages_limit = p_messages_limit,
      messages_used = CASE 
        -- Remise à 0 du compteur si renewal (status = active et nouvelle période)
        WHEN p_status = 'active' 
          AND current_period_end IS NOT NULL 
          AND p_current_period_start > current_period_end 
        THEN 0 
        ELSE messages_used 
      END,
      current_period_start = p_current_period_start,
      current_period_end = p_current_period_end,
      subscription_status = p_status,
      updated_at = now()
    WHERE id = v_existing_id
    RETURNING * INTO v_result;

  ELSE
    -- Insert nouveau
    INSERT INTO public.user_subscriptions (
      stripe_customer_id,
      stripe_subscription_id,
      stripe_session_id,
      plan,
      messages_limit,
      messages_used,
      current_period_start,
      current_period_end,
      subscription_status
    ) VALUES (
      p_stripe_customer_id,
      p_stripe_subscription_id,
      p_stripe_session_id,
      p_plan,
      p_messages_limit,
      0,
      p_current_period_start,
      p_current_period_end,
      p_status
    )
    RETURNING * INTO v_result;
  END IF;

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.apply_subscription_change(...) IS 
  'Upsert idempotent pour les webhooks Stripe.
   Identifie l''enregistrement par stripe_session_id OU stripe_customer_id.
   Si nouveau: insertion. Si existant: mise à jour.
   Remet messages_used à 0 lors d''un renouvellement (nouvelle période).
   Retourne l''enregistrement modifié.';


-- ============================================================
-- Fonction: link_stripe_session_to_user
-- Usage: Server Action appelée après signup pour lier la session
--        Stripe Checkout à l''utilisateur nouvellement créé
-- ============================================================

CREATE OR REPLACE FUNCTION public.link_stripe_session_to_user(
  p_stripe_session_id text,
  p_user_id uuid
)
RETURNS public.user_subscriptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_result public.user_subscriptions;
BEGIN
  -- Validation des paramètres
  IF p_stripe_session_id IS NULL OR p_user_id IS NULL THEN
    RAISE EXCEPTION 'stripe_session_id and user_id are required';
  END IF;

  -- Update la ligne correspondante avec le user_id
  UPDATE public.user_subscriptions
  SET 
    user_id = p_user_id,
    updated_at = now()
  WHERE 
    stripe_session_id = p_stripe_session_id
    AND user_id IS NULL
  RETURNING * INTO v_result;

  -- Si aucune ligne trouvée, retourne NULL
  -- (le webhook a peut-être déjà été traité et la ligne a un user_id)
  IF v_result IS NULL THEN
    -- On cherche quand même par customer_id pour les cas marginaux
    SELECT * INTO v_result
    FROM public.user_subscriptions
    WHERE stripe_session_id = p_stripe_session_id;
    
    IF v_result IS NULL THEN
      RETURN NULL;
    END IF;
  END IF;

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.link_stripe_session_to_user(text, uuid) IS 
  'Lie une session Stripe Checkout à un utilisateur après signup.
   Utilisée dans la Server Action linkStripeSessionToUser(sessionId, userId).
   Retourne la subscription mise à jour ou NULL si non trouvée.';
