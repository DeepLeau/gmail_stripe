-- Table temporaire pour le flow "pay-then-signup"
-- Stocke les sessions Stripe Checkout avant linkage utilisateur
-- session_id expire automatiquement via cron (voir migration plan)
CREATE TABLE IF NOT EXISTS public.pending_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id text NOT NULL UNIQUE,
  stripe_customer_id text NOT NULL,
  stripe_checkout_session_url text,
  plan text NOT NULL
    CHECK (plan IN ('start', 'scale', 'team')),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pending_subscriptions ENABLE ROW LEVEL SECURITY;

-- Index pour lookup rapide par session (webhook Stripe)
CREATE INDEX IF NOT EXISTS idx_pending_subscriptions_session
  ON public.pending_subscriptions(stripe_session_id);

-- Index pour lookup par customer (rétro-lien si session perdue)
CREATE INDEX IF NOT EXISTS idx_pending_subscriptions_customer
  ON public.pending_subscriptions(stripe_customer_id);

-- Index partial : uniquement les lignes non liées (pour cleanup cron)
CREATE INDEX IF NOT EXISTS idx_pending_subscriptions_unlinked
  ON public.pending_subscriptions(created_at)
  WHERE user_id IS NULL;
