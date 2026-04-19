-- ============================================
-- Migration 002: Index de performance
-- Optimisation webhook Stripe et comptage mensuel messages
-- ============================================

-- Index sur stripe_customer_id : webhooks Stripe cherchent par customer ID
-- Partiel car NULL pour users free (pas de relation Stripe)
CREATE INDEX IF NOT EXISTS idx_user_billing_stripe_customer_id
  ON public.user_billing(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Index sur pending_checkout_session_id : résolution post-paiement signup
-- Nullable (devient NULL une fois checkout complété)
CREATE INDEX IF NOT EXISTS idx_user_billing_pending_checkout
  ON public.user_billing(pending_checkout_session_id)
  WHERE pending_checkout_session_id IS NOT NULL;

-- Index unique sur stripe_subscription_id : évite doublons webhook
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_billing_stripe_subscription_id
  ON public.user_billing(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

-- Index sur user_id messages : filtrage rapide par utilisateur
CREATE INDEX IF NOT EXISTS idx_messages_user_id
  ON public.messages(user_id);

-- Index composite pour comptage mensuel messages par user
-- date_trunc('month', created_at) permet GROUP BY / COUNT efficace sans scan complet
CREATE INDEX IF NOT EXISTS idx_messages_user_month
  ON public.messages(user_id, date_trunc('month', created_at));
