-- ============================================
-- Migration 002: Table d'abonnement par utilisateur
-- ============================================
-- Table critique: lie un utilisateur à son plan Stripe.
-- WARNING: Aucune policy INSERT/UPDATE/DELETE côté client.
-- Toutes les écritures passent par le service_role (webhooks Stripe, endpoints serveur).
-- Le client ne peut que LIRE son propre abonnement via la policy SELECT.

-- Table des abonnements utilisateur
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.plans(id),             -- Plan actif (ou NULL si pas encore lié)
  
  -- Identifiants Stripe
  stripe_customer_id text,                                       -- UNIQUE, non-null après webhook
  stripe_subscription_id text,                                   -- ID abonnement Stripe (nullable en attente)
  stripe_session_id text,                                        -- Session checkout (nullable jusqu'à payment)
  
  -- État de l'abonnement
  subscription_status text NOT NULL DEFAULT 'inactive'
    CHECK (subscription_status IN ('inactive', 'active', 'cancelled', 'past_due', 'trialing')),
  
  -- Quota de messages
  quota_used integer NOT NULL DEFAULT 0 CHECK (quota_used >= 0),  -- Compteur courant
  quota_renewed_at timestamptz NOT NULL DEFAULT now(),            -- Date du dernier reset mensuel
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Contrainte: un utilisateur ne peut avoir qu'un seul abonnement actif à la fois
  -- (les anciens sont marqués cancelled, pas supprimés)
  CONSTRAINT one_active_subscription_per_user EXCLUDE (
    USING gist (user_id WITH =, subscription_status WITH =)
  ) WHERE (subscription_status IN ('active', 'trialing'))
);

-- Index unique sur stripe_customer_id (un customer Stripe ne peut être lié qu'à un seul abonnement)
-- Condition: uniquement pour les lignes avec customer_id non-null
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer
  ON public.user_subscriptions(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Index unique sur stripe_session_id (une session checkout ne peut être liée qu'à un seul abonnement)
-- Empêche la duplication si Stripe réutilisait une session
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_session
  ON public.user_subscriptions(stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

-- Index sur user_id pour lookup rapide (RLS utilise cet index)
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);

-- Activer RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: lecture — utilisateur peut voir UNIQUEMENT son propre abonnement
-- Note: USING = user_id, pas de WITH CHECK (lecture seule)
CREATE POLICY "Users can read their own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- PAS de policy INSERT — réservé service_role (webhook Stripe creates la row)
-- PAS de policy UPDATE — réservé service_role (webhook Stripe met à jour status)
-- PAS de policy DELETE — réservé service_role (cleanup si besoin)

-- Trigger pour updated_at automatique
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
