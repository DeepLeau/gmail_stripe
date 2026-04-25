-- ============================================================
-- MIGRATION 001: Create subscriptions table
-- Context: Intégration Stripe Subscription avec flow "paiement avant account creation"
-- L'utilisateur paie sur Stripe, puis crée son compte, et l'abonnement est lié automatiquement.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  -- Identifiants
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Stripe identifiers
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_session_id text,
  
  -- Plan et limites
  plan_slug text NOT NULL CHECK (plan_slug IN ('start', 'scale', 'team')),
  messages_limit integer NOT NULL CHECK (messages_limit > 0),
  messages_used integer NOT NULL DEFAULT 0 CHECK (messages_used >= 0),
  
  -- Status de l'abonnement
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'canceled', 'past_due')),
  
  -- Période de facturation
  current_period_start timestamptz,
  current_period_end timestamptz,
  
  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index unique pour lookup par session Stripe (post-checkout,linking)
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_session
  ON public.subscriptions(stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

-- Index unique pour lookup par customer Stripe (webhooks)
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_customer
  ON public.subscriptions(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Index pour requête par user_id (dashboard, chat)
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
  ON public.subscriptions(user_id)
  WHERE user_id IS NOT NULL;
