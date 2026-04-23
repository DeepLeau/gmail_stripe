-- Index unique sur stripe_subscription_id pour lookup webhook
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_sub
  ON public.user_subscriptions(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;
