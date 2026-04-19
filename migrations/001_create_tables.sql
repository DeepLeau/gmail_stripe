-- ============================================
-- Migration 001: Création des tables de base
-- Tables: user_billing (abonnement/quotas Stripe) + messages (historique)
-- ============================================

-- Table user_billing : stockage abonnement, quotas, refs Stripe par utilisateur
-- Note: stripe_customer_id et stripe_subscription_id sont NULL pour les users free
-- Les colonnes plan/limites sont en lecture seule pour le client (service_role only)
CREATE TABLE IF NOT EXISTS public.user_billing (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Plan d'abonnement (lecture seule client - modifiable uniquement via webhook Stripe)
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'start', 'scale', 'team')),
  
  -- Statut abonnement Stripe
  subscription_status text NOT NULL DEFAULT 'inactive' 
    CHECK (subscription_status IN ('inactive', 'active', 'past_due', 'canceled', 'trialing')),
  
  -- Quota messages mensuel
  messages_limit integer NOT NULL DEFAULT 100 CHECK (messages_limit >= 0),
  messages_used integer NOT NULL DEFAULT 0 CHECK (messages_used >= 0),
  quota_reset_at timestamptz NOT NULL DEFAULT date_trunc('month', now()),
  
  -- Références Stripe (nullable pour users free sans checkout)
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  
  -- Session checkout en attente (pour linking post-signup)
  pending_checkout_session_id text,
  
  -- Dates trial (si applicable)
  trial_ends_at timestamptz,
  
  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table messages : historique conversations utilisateur/IA
-- role restreint à 'user'|'ai' pour intégrité conversation
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'ai')),
  content text NOT NULL,
  model text,
  tokens_used integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
