-- =============================================================================
-- MIGRATION 007: Policy ALL pour service_role
-- Note: service_role bypass RLS de toute façon, cette policy est surtout pour
-- documenter l'intention et permettre un accès direct non-RPC si nécessaire
-- =============================================================================

CREATE POLICY "user_subscriptions_service_role_all"
  ON public.user_subscriptions
  FOR ALL
  USING (true)
  WITH CHECK (true);

COMMENT ON POLICY user_subscriptions_service_role_all 
  ON public.user_subscriptions IS 
  'Permet au service_role (webhooks Stripe, endpoints serveur) toutes les operations';
