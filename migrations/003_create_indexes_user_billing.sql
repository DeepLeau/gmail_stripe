-- Index pour optimisation des webhooks Stripe (recherche par customer_id)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_billing_stripe_customer
  ON public.user_billing(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Index pour optimisation des requêtes de quota (chaque /api/chat/send filtre par user_id)
CREATE INDEX IF NOT EXISTS idx_user_billing_user_id
  ON public.user_billing(user_id);

-- Index pour recherche par subscription_id (webhooks update/delete)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_billing_stripe_subscription
  ON public.user_billing(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

-- Index partiel pour trouver les abonnements actifs (usage cron)
CREATE INDEX IF NOT EXISTS idx_user_billing_active
  ON public.user_billing(user_id, current_period_end)
  WHERE subscription_status IN ('active', 'trialing');
