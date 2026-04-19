-- Retourne la limite de messages selon le plan
-- Fonction utilitaire appelée par le code applicatif ou un trigger
CREATE OR REPLACE FUNCTION public.get_plan_message_limit(p_plan text)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN CASE p_plan
    WHEN 'start' THEN 10
    WHEN 'scale' THEN 50
    WHEN 'team' THEN 100
    ELSE 0
  END;
END;
$$;

REVOKE ALL ON FUNCTION public.get_plan_message_limit(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_plan_message_limit(text) TO authenticated;

COMMENT ON FUNCTION public.get_plan_message_limit IS 'Retourne la limite de messages pour un plan (start=10, scale=50, team=100). IMMUTABLE.';
