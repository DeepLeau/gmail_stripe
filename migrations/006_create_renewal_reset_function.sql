-- ============================================
-- Migration 006: Fonction cron réinitialisation quotas
-- Remet à zéro les compteurs des profils expirés
-- SECURITY DEFINER + search_path pour cron job
-- ============================================
CREATE OR REPLACE FUNCTION public.reset_expired_quotas()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated_count INTEGER;
BEGIN
  -- Réinitialisation bulk des quotas expirés
  UPDATE public.profiles
  SET 
    messages_count = 0,
    renewal_date = renewal_date + INTERVAL '1 month',
    updated_at = NOW()
  WHERE 
    renewal_date IS NOT NULL
    AND renewal_date < NOW()
    AND plan != 'free';

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RETURN v_updated_count;
END;
$$;

-- Grant pour service_role (cron job utilise service_role)
GRANT EXECUTE ON FUNCTION public.reset_expired_quotas() TO service_role;
