-- ============================================================
-- Migration 001: Création de la table user_subscriptions
-- Context: Stockage des abonnements Stripe avec support du flow
-- checkout anonyme → signup → linking post-signup
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  -- Identifiants principaux
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Liaison utilisateur (nullable pour support checkout anonyme)
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- IDs Stripe
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  stripe_session_id text UNIQUE,
  
  -- Plan et quotas
  plan text NOT NULL DEFAULT 'start' 
    CHECK (plan IN ('start', 'scale', 'team')),
  messages_limit integer NOT NULL DEFAULT 10,
  messages_used integer NOT NULL DEFAULT 0,
  
  -- Statut abonnement
  subscription_status text NOT NULL DEFAULT 'incomplete'
    CHECK (subscription_status IN (
      'incomplete', 'active', 'past_due', 'canceled', 'trialing', 'unpaid'
    )),
  
  -- Periodes de facturation
  current_period_start timestamptz,
  current_period_end timestamptz,
  
  -- Timestamps métier
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Contraites métier
  CONSTRAINT messages_used_non_negative CHECK (messages_used >= 0),
  CONSTRAINT messages_limit_positive CHECK (messages_limit > 0),
  CONSTRAINT period_dates_valid CHECK (
    current_period_end IS NULL OR current_period_start IS NULL 
    OR current_period_end > current_period_start
  )
);

-- Index pour requêtes fréquentes par user
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id 
  ON public.user_subscriptions(user_id);

COMMENT ON TABLE public.user_subscriptions IS 
  'Table de gestion des abonnements utilisateur via Stripe. 
   Le user_id est nullable pour supporter le flow checkout anonyme 
   où le webhook peut arriver avant le signup.';

COMMENT ON COLUMN public.user_subscriptions.stripe_session_id IS 
  'Session ID Stripe du checkout. Utilisé pour le linking post-signup 
   quand le user_id nest pas encore connu au moment du checkout.';

COMMENT ON COLUMN public.user_subscriptions.messages_used IS 
  'Compteur de messages envoyés ce mois. Remis à 0 par le webhook 
   de renouvellement stripe.';
