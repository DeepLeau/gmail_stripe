-- ============================================
-- Migration 005: Trigger automatique updated_at
-- Met à jour updated_at sur toute modification de user_billing
-- ============================================

-- Fonction trigger : met à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur user_billing uniquement (pas besoin sur messages - pas de UPDATE client)
DROP TRIGGER IF EXISTS trigger_update_user_billing_updated_at ON public.user_billing;
CREATE TRIGGER trigger_update_user_billing_updated_at
  BEFORE UPDATE ON public.user_billing
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
