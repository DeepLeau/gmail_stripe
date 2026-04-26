-- Migration: 001_create_user_billing.sql
-- Création de la table user_billing pour stocker plan, IDs Stripe et statut d'abonnement
-- Sécurisé : seules les colonnes non-sensibles sont modifiables côté client via RLS
-- Les colonnes plan, subscription_status, stripe_* sont lecture seule (service_role only)

-- 1. Table principale user_billing
CREATE TABLE IF NOT EXISTS public.user_billing (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'start', 'scale', 'team')),
  subscription_status text NOT NULL DEFAULT 'inactive'
    CHECK (subscription_status IN ('inactive', 'active', 'trialing', 'past_due', 'canceled')),
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  trial_ends_at timestamptz,
  subscription_ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Index pour requêtes rapides par customer Stripe
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_billing_stripe_customer
  ON public.user_billing(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- 3. Activation RLS
ALTER TABLE public.user_billing ENABLE ROW LEVEL SECURITY;

-- 4. Policy SELECT — utilisateur peut lire sa propre ligne de facturation
-- Permet d'afficher le plan actuel et le statut dans le chat
CREATE POLICY "Users read own billing"
  ON public.user_billing FOR SELECT
  USING (auth.uid() = user_id);

-- 5. Policy INSERT — service_role only (pas de policy = interdiction côté client)
-- L'initialisation se fait via endpoint serveur après création de compte Stripe

-- 6. Policy UPDATE — PROTÉGÉE : AUCUNE colonne modifiable côté client
-- USING : filtre les lignes visibles (user voit uniquement sa propre row)
-- WITH CHECK (false) : bloque toute modification — service_role only
CREATE POLICY "No client update billing"
  ON public.user_billing FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (false);

-- 7. Policy DELETE — service_role only (pas de policy = interdiction côté client)
-- Les suppressions se font via webhook Stripe ou endpoint admin

-- 8. Trigger updated_at automatique
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_user_billing_updated_at
  BEFORE UPDATE ON public.user_billing
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
