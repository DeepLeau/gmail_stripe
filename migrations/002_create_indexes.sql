-- Migration 002: Index sur les colonnes de lookup webhook
-- Index partiel sur stripe_customer_id (nullable) pour lookup rapide dans webhook Stripe
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer_id
  ON public.user_subscriptions(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Index partiel sur stripe_subscription_id pour customer.subscription.updated
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id
  ON public.user_subscriptions(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

-- Index partiel sur stripe_session_id pour linking post-signup
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_session_id
  ON public.user_subscriptions(stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

-- Index sur user_id pour jointures rapides (user_id est déjà UNIQUE, index aide aux lookup)
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id
  ON public.user_subscriptions(user_id)
  WHERE user_id IS NOT NULL;
