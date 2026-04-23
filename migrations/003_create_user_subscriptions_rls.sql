-- ============================================================
-- Migration 003: Row Level Security
-- Règle de sécurité critique : le client ne peut PAS modifier sa
-- subscription. Toutes les écritures passent par des RPC
-- server-side (webhook handlers, service_role).
-- ============================================================

BEGIN;

-- Activation RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- SELECT: un utilisateur lit uniquement sa propre subscription
CREATE POLICY "Users read own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: côté client INTERDIT (service_role via RPC uniquement)
-- Ne pas créer de policy = opération interdite par défaut PostgreSQL
CREATE POLICY "No client insert subscription"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (false);

-- UPDATE: côté client INTERDIT — pas de modification directe du plan,
-- statut, limites ou dates. Seul le service_role (via webhook RPC) peut écrire.
CREATE POLICY "No client update subscription"
  ON public.user_subscriptions FOR UPDATE
  USING (false);

-- DELETE: côté client INTERDIT — pas de suppression directe
CREATE POLICY "No client delete subscription"
  ON public.user_subscriptions FOR DELETE
  USING (false);

COMMIT;
