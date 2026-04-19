-- Index pour accélérer les webhooks Stripe et les requêtes métier

-- Index unique partiel sur stripe_subscription_id (nullable mais unique quand présent)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_sub_id
  ON public.user_subscriptions(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

-- Index unique partiel sur stripe_customer_id (nullable mais unique quand présent)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_cust_id
  ON public.user_subscriptions(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Index partiel : un seul abonnement actif/trialing par user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_active
  ON public.user_subscriptions(user_id)
  WHERE subscription_status IN ('active', 'trialing');

-- Index sur reset_at pour le cron de réinitialisation mensuelle
CREATE INDEX IF NOT EXISTS idx_message_usage_reset_at
  ON public.message_usage(reset_at);
