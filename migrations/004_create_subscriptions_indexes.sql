-- Index sur subscriptions pour requêtes fréquentes et webhooks Stripe
-- Tous IF NOT EXISTS pour idempotence

-- Index principal: requêtes par utilisateur (dashboard, limite messages)
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);

-- Index unique: corrélation Checkout session → abonnement
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_stripe_session_id
  ON public.subscriptions(stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

-- Index unique: corrélation Stripe subscription → abonnement (webhooks)
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id
  ON public.subscriptions(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

-- Index unique: matching Stripe customer → abonnement
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id
  ON public.subscriptions(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Index pour filtre abonnements actifs (realtime, dashboard)
CREATE INDEX IF NOT EXISTS idx_subscriptions_active
  ON public.subscriptions(user_id, current_period_end)
  WHERE status IN ('active', 'trialing');
