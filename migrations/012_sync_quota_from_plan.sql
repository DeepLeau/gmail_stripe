-- Sync le messages_limit dans monthly_usage depuis le plan dans user_subscriptions
-- Résout le cas où le plan change (via webhook) et le quota doit suivre automatiquement
-- SECURITY DEFINER : réservé service_role
CREATE OR REPLACE FUNCTION public.sync_quota_from_plan(p_user_id uuid)
RETURNS public.monthly_usage
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_plan text;
  v_limit integer;
BEGIN
  -- Récupère le plan de l'user
  SELECT plan INTO v_plan
  FROM public.user_subscriptions
  WHERE user_id = p_user_id;

  IF v_plan IS NULL THEN
    RAISE EXCEPTION 'No subscription found for user';
  END IF;

  -- Calcule la limite selon le plan
  v_limit := public.get_plan_message_limit(v_plan);

  -- Met à jour monthly_usage
  UPDATE public.monthly_usage
  SET messages_limit = v_limit,
      updated_at = now()
  WHERE user_id = p_user_id;

  RETURN QUERY SELECT * FROM public.monthly_usage WHERE user_id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_quota_from_plan(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_quota_from_plan(uuid) TO service_role;

COMMENT ON FUNCTION public.sync_quota_from_plan IS 'Sync messages_limit dans monthly_usage depuis le plan de user_subscriptions. Réservé service_role.';
