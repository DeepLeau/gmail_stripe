-- Fonction helper pour lire le plan et credits restants (appelée par Server Components)
CREATE OR REPLACE FUNCTION public.get_user_subscription(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- Sécurité : seul le owner ou service_role peut lire
  -- auth.role() est fiable : obtenu depuis la session authentifiée par PostgreSQL,
  -- contrairement à current_setting('request.jwt.claim.role') qui lit le JWT
  -- (forgable côté client).
  IF auth.uid() IS NOT NULL AND auth.uid() != p_user_id AND auth.role() != 'service_role' THEN
    RETURN jsonb_build_object('error', 'Forbidden');
  END IF;

  SELECT jsonb_build_object(
    'id', id,
    'plan', plan,
    'messages_limit', messages_limit,
    'messages_used', messages_used,
    'messages_remaining', messages_limit - messages_used,
    'current_period_end', current_period_end,
    'subscription_status', subscription_status,
    'is_active', subscription_status IN ('active', 'trialing')
  )
  INTO v_result
  FROM public.user_subscriptions
  WHERE user_id = p_user_id;

  -- Retourne null si pas d'abonnement (plan gratuit implicite)
  RETURN COALESCE(v_result, jsonb_build_object(
    'plan', 'free',
    'messages_limit', 0,
    'messages_used', 0,
    'messages_remaining', 0,
    'is_active', true
  ));
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_subscription(uuid) TO authenticated;
