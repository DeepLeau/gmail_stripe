-- Table principale de facturation : plan, statut abonnement, IDs Stripe, compteur messages
-- Colonnes sensibles (plan, subscription_status, stripe_*) non modifiables côté client
CREATE TABLE IF NOT EXISTS public.user_billing (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free', 'start', 'scale', 'team')),
  subscription_status text NOT NULL DEFAULT 'inactive'
    CHECK (subscription_status IN ('inactive', 'active', 'trialing', 'past_due', 'canceled')),
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  messages_used integer NOT NULL DEFAULT 0 CHECK (messages_used >= 0),
  trial_ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_billing ENABLE ROW LEVEL SECURITY;

-- Index pour requêtes par customer Stripe (webhooks, lookup)
CREATE INDEX IF NOT EXISTS idx_user_billing_stripe_customer
  ON public.user_billing(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;
