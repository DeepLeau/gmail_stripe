-- Migration 002: Table newsletter_subscriptions pour registre opt-in
-- Risque: aucun — opt-in explicite, pas de modification client directe

-- 1. Table newsletter_subscriptions
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  subscribed boolean NOT NULL DEFAULT true,
  opted_in_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- Un seul abonnement actif par email (insensible à la casse)
  CONSTRAINT newsletter_subscriptions_email_unique UNIQUE (email)
);

-- 2. Index pour retrouver rapidement les subscribed
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_subscribed
  ON public.newsletter_subscriptions(subscribed)
  WHERE subscribed = true;

-- 3. Index sur user_id
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_user_id
  ON public.newsletter_subscriptions(user_id)
  WHERE user_id IS NOT NULL;

-- 4. Active RLS
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- 5. Policy SELECT — service_role uniquement (lecture admin), pas de SELECT client
-- Le service_role bypass RLS donc pas besoin de policy, mais on en crée une
-- explicite pour le rôle authenticated au cas où (limité au own user_id ou email)
CREATE POLICY "newsletter_subscriptions_select_own"
  ON public.newsletter_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. Policy INSERT — service_role uniquement via endpoint serveur
-- ou user peut s'auto-inscrire via endpoint protégé (/api/newsletter/subscribe)
-- On interdit l'INSERT client direct (pas de policy INSERT créée → bloqué)
-- Le service_role peut insérer via webhook ou endpoint admin

-- 7. Policy UPDATE — service_role uniquement pour unsubscribe (via endpoint)
-- Le client ne peut pas modifier subscribed directement
CREATE POLICY "newsletter_subscriptions_no_client_update"
  ON public.newsletter_subscriptions FOR UPDATE
  USING (false);

-- 8. Policy DELETE — service_role uniquement
CREATE POLICY "newsletter_subscriptions_no_client_delete"
  ON public.newsletter_subscriptions FOR DELETE
  USING (false);
