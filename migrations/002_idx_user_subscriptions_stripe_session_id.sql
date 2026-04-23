-- =====================================================
-- MIGRATION 02: Index on stripe_session_id
-- Lookup rapide lors du linking post-signup
-- (path webhook → signup)
-- =====================================================
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_subscriptions_stripe_session_id
ON public.user_subscriptions (stripe_session_id)
WHERE stripe_session_id IS NOT NULL;

COMMENT ON INDEX idx_user_subscriptions_stripe_session_id IS 'Partial index for stripe_session_id lookups during post-signup linking.';
