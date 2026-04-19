-- Reset tous les compteurs monthly_usage au 1er du mois courant
-- Appelé par pg_cron ou manuellement par un admin
-- SECURITY DEFINER : permet l'update sans grant INSERT/UPDATE côté client
CREATE OR REPLACE FUNCTION public.reset_monthly_quotas()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_reset_date timestamptz := date_trunc('month', now());
  v_end_date timestamptz := v_reset_date + interval '1 month';
  v_rows_updated bigint;
BEGIN
  UPDATE public.monthly_usage
  SET messages_sent = 0,
      current_period_start = v_reset_date,
      current_period_end = v_end_date,
      updated_at = now()
  WHERE current_period_end <= now();

  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
  RETURN v_rows_updated;
END;
$$;

REVOKE ALL ON FUNCTION public.reset_monthly_quotas() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reset_monthly_quotas() TO service_role;

COMMENT ON FUNCTION public.reset_monthly_quotas IS 'Reset tous les compteurs expired. Retourne le nombre de lignes mises à jour. Réservé service_role.';
