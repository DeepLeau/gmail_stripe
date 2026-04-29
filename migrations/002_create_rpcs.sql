-- ============================================================
-- MIGRATION 002 — RPCs pour guest-subscription-quota
-- ============================================================

-- ─── decrement_units() — identique à auth-subscription-quota ───────────────
CREATE OR REPLACE FUNCTION public.decrement_units()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid;
  v_used int;
  v_limit int;
  v_status text;
  v_plan text;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'unauthorized');
  END IF;

  SELECT units_used, units_limit, subscription_status, plan
    INTO v_used, v_limit, v_status, v_plan
  FROM public.user_subscriptions
  WHERE user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'no_subscription_row');
  END IF;

  IF v_used >= v_limit THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'limit_reached',
      'remaining', 0,
      'plan', COALESCE(v_plan, 'free'),
      'subscription_status', v_status
    );
  END IF;

  UPDATE public.user_subscriptions
  SET units_used = units_used + 1
  WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'remaining', v_limit - (v_used + 1),
    'plan', COALESCE(v_plan, 'free'),
    'subscription_status', v_status
  );
END;
$$;

REVOKE ALL ON FUNCTION public.decrement_units() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.decrement_units() TO authenticated;

-- ─── apply_subscription_change() — webhook only ─────────────────────────────
-- Variante guest : si p_user_id est NULL, on écrit dans pending_checkouts (staging).
-- Si p_user_id est NON NULL, on écrit dans user_subscriptions normalement.
CREATE OR REPLACE FUNCTION public.apply_subscription_change(
  p_user_id uuid,
  p_plan text,
  p_units_limit int,
  p_stripe_customer_id text,
  p_stripe_subscription_id text,
  p_stripe_session_id text,
  p_subscription_status text,
  p_current_period_start timestamptz,
  p_current_period_end timestamptz,
  p_customer_email text,
  p_reset_units boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_user_id IS NOT NULL THEN
    -- Cas user déjà connu : on écrit dans user_subscriptions
    UPDATE public.user_subscriptions
    SET
      plan = p_plan,
      units_limit = p_units_limit,
      stripe_customer_id = p_stripe_customer_id,
      stripe_subscription_id = p_stripe_subscription_id,
      subscription_status = p_subscription_status,
      current_period_start = p_current_period_start,
      current_period_end = p_current_period_end,
      units_used = CASE WHEN p_reset_units THEN 0 ELSE units_used END
    WHERE user_id = p_user_id;

    IF NOT FOUND THEN
      INSERT INTO public.user_subscriptions (
        user_id, plan, units_limit, stripe_customer_id, stripe_subscription_id,
        subscription_status, current_period_start, current_period_end, units_used
      ) VALUES (
        p_user_id, p_plan, p_units_limit, p_stripe_customer_id, p_stripe_subscription_id,
        p_subscription_status, p_current_period_start, p_current_period_end, 0
      );
    END IF;

    RETURN jsonb_build_object('target', 'user_subscriptions', 'user_id', p_user_id);

  ELSE
    -- Cas user pas encore créé : on écrit dans pending_checkouts (staging)
    -- p_stripe_session_id est OBLIGATOIRE dans ce cas.
    IF p_stripe_session_id IS NULL THEN
      RAISE EXCEPTION 'apply_subscription_change: p_stripe_session_id required when p_user_id is NULL';
    END IF;

    INSERT INTO public.pending_checkouts (
      stripe_session_id, stripe_customer_id, stripe_subscription_id, plan,
      customer_email, current_period_start, current_period_end, subscription_status
    ) VALUES (
      p_stripe_session_id, p_stripe_customer_id, p_stripe_subscription_id, p_plan,
      p_customer_email, p_current_period_start, p_current_period_end, p_subscription_status
    )
    ON CONFLICT (stripe_session_id) DO UPDATE SET
      stripe_subscription_id = EXCLUDED.stripe_subscription_id,
      subscription_status = EXCLUDED.subscription_status,
      current_period_start = EXCLUDED.current_period_start,
      current_period_end = EXCLUDED.current_period_end;

    RETURN jsonb_build_object('target', 'pending_checkouts', 'session_id', p_stripe_session_id);
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_subscription_change(uuid, text, int, text, text, text, text, timestamptz, timestamptz, text, boolean) FROM PUBLIC;

-- ─── link_stripe_session_to_user() — appelée après signup ───────────────────
-- Migre une ligne pending_checkouts → user_subscriptions pour le user fraîchement créé.
-- Doit être appelée par une Server Action AVEC auth.uid() actif (le user vient de signer).
CREATE OR REPLACE FUNCTION public.link_stripe_session_to_user(p_session_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid;
  v_pending public.pending_checkouts%ROWTYPE;
  v_units_limit int;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'unauthorized');
  END IF;

  SELECT * INTO v_pending
  FROM public.pending_checkouts
  WHERE stripe_session_id = p_session_id
  FOR UPDATE;

  IF NOT FOUND THEN
    -- Le webhook n'est pas encore arrivé. Le client devra retry.
    RETURN jsonb_build_object('success', false, 'error', 'pending_not_found', 'retry', true);
  END IF;

  IF v_pending.linked_user_id IS NOT NULL THEN
    -- Déjà lié — soit à cet user (idempotent OK), soit à un autre (anomalie).
    IF v_pending.linked_user_id = v_user_id THEN
      RETURN jsonb_build_object('success', true, 'already_linked', true);
    ELSE
      RETURN jsonb_build_object('success', false, 'error', 'session_linked_to_another_user');
    END IF;
  END IF;

  -- Calcule la limite à partir du plan. On ne peut pas appeler getPlanLimit() côté
  -- SQL, donc on hardcode le mapping plan->limit ici, généré par le moteur de rendu
  -- via la variable plan_limit_case_when_lines (substituée au templating).
  v_units_limit := CASE v_pending.plan
    WHEN 'starter' THEN 50
    WHEN 'growth' THEN 200
    WHEN 'pro' THEN 1000
    ELSE 0
  END;

  -- UPSERT user_subscriptions
  UPDATE public.user_subscriptions
  SET
    plan = v_pending.plan,
    units_limit = v_units_limit,
    stripe_customer_id = v_pending.stripe_customer_id,
    stripe_subscription_id = v_pending.stripe_subscription_id,
    subscription_status = v_pending.subscription_status,
    current_period_start = v_pending.current_period_start,
    current_period_end = v_pending.current_period_end,
    units_used = 0
  WHERE user_id = v_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.user_subscriptions (
      user_id, plan, units_limit, stripe_customer_id, stripe_subscription_id,
      subscription_status, current_period_start, current_period_end, units_used
    ) VALUES (
      v_user_id, v_pending.plan, v_units_limit, v_pending.stripe_customer_id,
      v_pending.stripe_subscription_id, v_pending.subscription_status,
      v_pending.current_period_start, v_pending.current_period_end, 0
    );
  END IF;

  -- Marque la ligne staging comme linkée (pour traçabilité)
  UPDATE public.pending_checkouts
  SET linked_user_id = v_user_id, linked_at = now()
  WHERE stripe_session_id = p_session_id;

  RETURN jsonb_build_object(
    'success', true,
    'plan', v_pending.plan,
    'units_limit', v_units_limit,
    'subscription_status', v_pending.subscription_status
  );
END;
$$;

REVOKE ALL ON FUNCTION public.link_stripe_session_to_user(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.link_stripe_session_to_user(text) TO authenticated;

COMMENT ON FUNCTION public.link_stripe_session_to_user IS
  'Migrates pending_checkouts row → user_subscriptions for the freshly signed-up user. Called by linkStripeSessionToUser Server Action after supabase.auth.signUp().';
