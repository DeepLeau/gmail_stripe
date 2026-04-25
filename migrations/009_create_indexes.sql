-- Index sur les tables de billing pour optimiser les requêtes webhook et lecture
-- Ordre de création : indexes non-bloquants sur tables déjà existantes

-- Index sur pending_stripe_links : recherche rapide par session ID (webhook handler)
CREATE INDEX IF NOT EXISTS idx_pending_stripe_links_session_id
  ON public.pending_stripe_links(stripe_session_id);

-- Index sur pending_stripe_links : expiration pour nettoyage périodique
CREATE INDEX IF NOT EXISTS idx_pending_stripe_links_expires_at
  ON public.pending_stripe_links(expires_at)
  WHERE expires_at < now();

-- Index sur user_subscriptions : recherche rapide par customer ID (webhook handler)
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_customer_id
  ON public.user_subscriptions(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Index sur user_subscriptions : lecture rapide de l'abonnement courant par utilisateur
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id
  ON public.user_subscriptions(user_id);

-- Index sur user_subscriptions : abonnement actif par customer (utile pour renewals)
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_active
  ON public.user_subscriptions(stripe_customer_id)
  WHERE status IN ('active', 'trialing');

-- Index sur message_usage : lecture rapide du compteur par utilisateur (chat — messages restants)
CREATE INDEX IF NOT EXISTS idx_message_usage_user_period
  ON public.message_usage(user_id, period_start DESC);

-- Index sur message_usage : expiration pour reset automatique (dernier jour du mois)
-- L'index sur created_at (brut) suffit pour les requêtes de période
-- Les queries utilisant date_trunc dans le WHERE utiliseront cet index si la plage est correcte
CREATE INDEX IF NOT EXISTS idx_message_usage_created_at
  ON public.message_usage(created_at);
