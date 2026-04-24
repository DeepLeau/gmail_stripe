-- ============================================================
-- Migration 002: Index additionnels sur user_subscriptions
-- ============================================================

-- Index unique sur session_id pour le linking post-signup
-- Les valeurs NULL sont ignorées par les contraintes UNIQUE
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_session_id 
  ON public.user_subscriptions(stripe_session_id) 
  WHERE stripe_session_id IS NOT NULL;

-- Index unique sur stripe_customer_id pour le linking post-webhook
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer_id 
  ON public.user_subscriptions(stripe_customer_id) 
  WHERE stripe_customer_id IS NOT NULL;

-- Index unique sur stripe_subscription_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id 
  ON public.user_subscriptions(stripe_subscription_id) 
  WHERE stripe_subscription_id IS NOT NULL;

-- Index pour requêtes par statut (ex: renouvellement mensuel)
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status 
  ON public.user_subscriptions(subscription_status) 
  WHERE subscription_status IN ('active', 'trialing');

-- Index pour requêtes par période (ex: renouvellement proche)
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_period_end 
  ON public.user_subscriptions(current_period_end) 
  WHERE current_period_end IS NOT NULL;
