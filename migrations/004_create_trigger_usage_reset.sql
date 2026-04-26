-- Migration: 004_create_trigger_usage_reset.sql
-- Trigger BEFORE UPDATE sur period_start pour reset automatique du compteur
-- Se déclenche UNIQUEMENT si period_start est modifié (via service_role, pas client)
-- Le client ne peut pas modifier period_start (policy WITH CHECK le bloque)

-- 1. Trigger sur modification de period_start
-- Réinitialise messages_used à 0 quand la période change
CREATE OR REPLACE TRIGGER on_usage_period_change
  BEFORE UPDATE OF period_start ON public.user_usage
  FOR EACH ROW
  WHEN (OLD.period_start IS DISTINCT FROM NEW.period_start)
  EXECUTE FUNCTION public.reset_monthly_usage();

-- Note: Ce trigger est déclenché PAR le service_role lors du changement de mois,
-- pas par le client. La policy UPDATE de user_usage bloque la modification de
-- period_start côté client, donc le trigger ne s'exécutera que pour le serveur.
