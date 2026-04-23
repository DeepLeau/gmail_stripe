-- Migration 006 : Index sur stripe_customer_id pour les lookups webhook
-- Index B-tree standard pour accélération des recherches par customer ID

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer_id
  ON public.user_subscriptions(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Index partiel unique pour garantir qu'un utilisateur n'a qu'un seul abonnement actif
-- Permet les abonnements annulés dans la même table sans conflit
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_active_user
  ON public.user_subscriptions(user_id)
  WHERE subscription_status IN ('active', 'trialing')
    AND user_id IS NOT NULL;

-- Index sur session_id pour le linking post-signup
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_session_id
  ON public.user_subscriptions(session_id)
  WHERE session_id IS NOT NULL;
