-- =====================================================
-- MIGRATION 03: Index on stripe_customer_id
-- Lookup lors des events subscription.updated
-- =====================================================
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_subscriptions_stripe_customer_id
ON public.user_subscriptions (stripe_customer_id)
WHERE stripe_customer_id IS NOT NULL;

COMMENT ON INDEX idx_user_subscriptions_stripe_customer_id IS 'Partial index for stripe_customer_id lookups during subscription events.';
