-- Migration 001: Create subscription_plan enum type et user_subscriptions table
-- Ce type définit les 3 plans disponibles avec leurs quotas message
CREATE TYPE subscription_plan AS ENUM ('start', 'scale', 'team');

-- Table principale de gestion des abonnements Stripe
-- user_id UNIQUE: un seul abonnement actif par utilisateur
-- Les colonnes stripe_* sont nullable pour gérer le cas webhook-first (session liée avant signup)
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Référence utilisateur Supabase (UNIQUE: un abonnement par user)
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Identifiants Stripe (UNIQUE: un seul stripe_customer_id par subscription)
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  stripe_session_id text UNIQUE,
  
  -- Plan et quotas
  plan subscription_plan NOT NULL DEFAULT 'start',
  messages_limit integer NOT NULL DEFAULT 10,
  messages_used integer NOT NULL DEFAULT 0,
  
  -- Période de facturation actuelle
  current_period_start timestamptz,
  current_period_end timestamptz,
  
  -- Statut de l'abonnement
  -- CHECK constraint obligatoire pour garantir les états métier valides
  -- (colonne sensible : seule une fonction serveur contrôlée peut la modifier)
  subscription_status text DEFAULT 'inactive'
    CHECK (subscription_status IN ('inactive', 'active', 'past_due', 'canceled', 'trialing')),
  
  -- Timestamps d'audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Contraintes métier
  CONSTRAINT chk_messages_used_non_negative CHECK (messages_used >= 0),
  CONSTRAINT chk_messages_used_within_limit CHECK (messages_used <= messages_limit),
  CONSTRAINT chk_messages_limit_positive CHECK (messages_limit > 0),
  CONSTRAINT chk_plan_valid CHECK (plan IN ('start', 'scale', 'team'))
);
