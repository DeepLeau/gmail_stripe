-- Met à jour le plan et le quota d'un utilisateur (appelé par le webhook Stripe)
-- Résout aussi les refs Stripe (customer_id, subscription_id)
-- SECURITY DEFINER : bypass RLS pour écrire sans grant côté client
-- Réservé au service_role uniquement (webhook Stripe)
CREATE OR REPLACE FUNCTION public.update_user_quota(
  p_user_id uuid,
  p_plan text,
  p_messages_limit integer,
  p_stripe_customer_id text DEFAULT NULL,
  p_stripe_subscription_id text DEFAULT NULL,
  p_current_period_start timestamptz DEFAULT NULL,
  p_current_period_end timestamptz DEFAULT NULL,
  p_subscription_status text DEFAULT NULL
)
RETURNS public.user_subscriptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Validation des paramètres
  IF p_plan NOT IN ('start', 'scale', 'team') THEN
    RAISE EXCEPTION 'Invalid plan: must be start, scale, or team';
  END IF;

  IF p_messages_limit < 0 THEN
    RAISE EXCEPTION 'messages_limit must be >= 0';
  END IF;

  -- Upsert atomique
  INSERT INTO public.user_subscriptions (
    user_id, plan, subscription_status, stripe_customer_id,
    stripe_subscription_id, current_period_start, current_period_end, updated_at
  )
  VALUES (
    p_user_id, p_plan, COALESCE(p_subscription_status, 'active'),
    COALESCE(p_stripe_customer_id, NULL),
    COALESCE(p_stripe_subscription_id, NULL),
    p_current_period_start,
    p_current_period_end,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan = EXCLUDED.plan,
    subscription_status = COALESCE(EXCLUDED.subscription_status, user_subscriptions.subscription_status),
    stripe_customer_id = COALESCE(NULLIF(EXCLUDED.stripe_customer_id, ''), user_subscriptions.stripe_customer_id),
    stripe_subscription_id = COALESCE(NULLIF(EXCLUDED.stripe_subscription_id, ''), user_subscriptions.stripe_subscription_id),
    current_period_start = COALESCE(EXCLUDED.current_period_start, user_subscriptions.current_period_start),
    current_period_end = COALESCE(EXCLUDED.current_period_end, user_subscriptions.current_period_end),
    updated_at = now();

  -- Met à jour monthly_usage.messages_limit
  UPDATE public.monthly_usage
  SET messages_limit = p_messages_limit,
      current_period_start = COALESCE(p_current_period_start, current_period_start),
      current_period_end = COALESCE(p_current_period_end, current_period_end),
      updated_at = now()
  WHERE user_id = p_user_id;

  RETURN QUERY SELECT * FROM public.user_subscriptions WHERE user_id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.update_user_quota(uuid, text, integer, text, text, timestamptz, timestamptz, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_user_quota(uuid, text, integer, text, text, timestamptz, timestamptz, text) TO service_role;

COMMENT ON FUNCTION public.update_user_quota IS 'Met à jour le plan, quota et refs Stripe d''un user. Réservé au service_role (webhook Stripe). SECURITY DEFINER.';
