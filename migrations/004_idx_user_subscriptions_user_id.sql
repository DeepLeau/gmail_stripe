-- =====================================================
-- MIGRATION 04: Index on user_id
-- Requêtes fréquentes du badge abonnement et header chat
-- =====================================================
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_subscriptions_user_id
ON public.user_subscriptions (user_id)
WHERE user_id IS NOT NULL;

COMMENT ON INDEX idx_user_subscriptions_user_id IS 'Partial index for user_id lookups in badge and header components.';
