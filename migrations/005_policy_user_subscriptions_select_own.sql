-- =============================================================================
-- MIGRATION 005: Policy SELECT - utilisateur lit uniquement sa propre ligne
-- =============================================================================

CREATE POLICY "user_subscriptions_own_select"
  ON public.user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

COMMENT ON POLICY user_subscriptions_own_select 
  ON public.user_subscriptions IS 
  'Autorise les utilisateurs à lire uniquement leur propre abonnement';
