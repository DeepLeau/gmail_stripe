-- ============================================================
-- Migration 003: Activation RLS + Policies sur user_subscriptions
-- 
-- Sécurité: Le client ne peut QUE lire sa propre ligne.
-- Les modifications (INSERT, UPDATE, DELETE) sont reservées au
-- service_role uniquement (webhooks Stripe, endpoints serveur).
-- ============================================================

-- Activation RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy SELECT: le user peut lire sa propre ligne uniquement
CREATE POLICY "client_select_own_subscription"
  ON public.user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Pas de policy INSERT → operation interdite côté client
-- Pas de policy UPDATE → operation interdite côté client
-- Pas de policy DELETE → operation interdite côté client
-- Le service_role (webhooks, server actions) bypass RLS automatiquement
-- et peut inserer/modifier via linkStripeSessionToUser et apply_subscription_change

COMMENT ON POLICY "client_select_own_subscription" ON public.user_subscriptions IS 
  'Permet au client de lire uniquement sa propre ligne de subscription. 
   Les writes (INSERT, UPDATE, DELETE) ne sont pas authorisées côté client,
   réservé au service_role via les RPC server-side.';
