-- Vérifie le quota restant pour un utilisateur
-- Retourne messages_sent, messages_limit, remaining, is_over_limit, current_period_start, current_period_end
-- SECURITY INVOKER + vérification user_id match
CREATE OR REPLACE FUNCTION public.check_user_quota(p_user_id uuid DEFAULT auth.uid())
RETURNS TABLE (
  messages_sent integer,
  messages_limit integer,
  remaining integer,
  is_over_limit boolean,
  current_period_start timestamptz,
  current_period_end timestamptz
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Vérification auth
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Vérification user_id match (empêche de lire le quota d'un autre)
  IF auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Access denied: you can only check your own quota';
  END IF;

  RETURN QUERY
  SELECT
    mu.messages_sent,
    mu.messages_limit,
    GREATEST(mu.messages_limit - mu.messages_sent, 0) AS remaining,
    mu.messages_sent > mu.messages_limit AS is_over_limit,
    mu.current_period_start,
    mu.current_period_end
  FROM public.monthly_usage mu
  WHERE mu.user_id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.check_user_quota(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_user_quota(uuid) TO authenticated;

COMMENT ON FUNCTION public.check_user_quota IS 'Vérifie le quota restant pour le user connecté. Retourne messages_sent, limit, remaining, is_over_limit, period dates.';
