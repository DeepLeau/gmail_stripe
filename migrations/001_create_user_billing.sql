-- Création de la table user_billing pour le système d'abonnement Stripe
-- Stocke plan, statut Stripe, IDs Stripe et quotas de messages par utilisateur
CREATE TABLE IF NOT EXISTS public.user_billing (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Plan d'abonnement (sensible — modifié uniquement via webhook Stripe/service_role)
  plan text NOT NULL DEFAULT 'free',
  
  -- Statut d'abonnement Stripe (sensible — modifié uniquement via webhook Stripe)
  subscription_status text NOT NULL DEFAULT 'inactive',
  
  -- IDs Stripe (sensibles — jamais modifiables côté client)
  stripe_customer_id text,
  stripe_subscription_id text,
  
  -- Période de facturation actuelle
  current_period_start timestamptz,
  current_period_end timestamptz,
  
  -- Quotas de messages (modifiables uniquement par le serveur via update_quota_if_allowed)
  messages_limit integer NOT NULL DEFAULT 10,
  messages_used integer NOT NULL DEFAULT 0,
  
  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
