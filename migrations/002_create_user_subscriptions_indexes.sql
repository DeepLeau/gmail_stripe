-- ============================================================
-- Migration 002: Indexes pour lookup rapide
-- - session_id: linking post-signup (unique car une session = un checkout)
-- - user_id: gating chat, UserMenu
-- - customer_id: webhook post-linking (unique car un customer = un abonné)
-- Index partiels sur les colonnes nullable pour ne pas indexer les NULLs.
-- ============================================================

BEGIN;

-- Recherche rapide par session Stripe (linking post-signup)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_checkout
  ON public.user_subscriptions(stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;

-- Lookup par user_id (chat gating, UserMenu)
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user
  ON public.user_subscriptions(user_id);

-- Lookup par customer Stripe (webhook après linking)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_customer
  ON public.user_subscriptions(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Index pour requêtes de stats par plan
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_status
  ON public.user_subscriptions(plan, subscription_status)
  WHERE subscription_status = 'active';

COMMIT;
