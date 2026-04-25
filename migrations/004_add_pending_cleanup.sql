-- ============================================================
-- MIGRATION 004: Add function to cleanup stale pending subscriptions
-- Context: Abonnements pending orphelins si utilisateur paie puis change de plan
--          ou paie mais ne crée jamais de compte
-- Solution: Suppression automatique des pending > 24h via pg_cron ou Vercel Cron
-- NOTE: Cette fonction est optionnelle — à scheduler séparément
-- ============================================================

CREATE OR REPLACE FUNCTION public.cleanup_stale_pending_subscriptions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.subscriptions
  WHERE status = 'pending'
    AND created_at < now() - interval '24 hours'
    AND user_id IS NULL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- NOTE: Pour pg_cron (si disponible sur votre instance Supabase)
-- SELECT cron.schedule('cleanup-pending-subscriptions', '0 3 * * *', 
--   'SELECT public.cleanup_stale_pending_subscriptions()');

COMMENT ON FUNCTION public.cleanup_stale_pending_subscriptions IS 
  'Supprime les abonnements pending de plus de 24h sans user_id. 
   Scheduler via pg_cron ou Vercel Cron externe.';
