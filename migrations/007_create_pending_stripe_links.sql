-- Table pending_stripe_links : stockage temporaire des sessions Stripe Checkout en attente
-- Flow : user paie sur Stripe → stripe_session_id stocké ici → user crée son compte
--        → webhook Stripe vérifie le session_id et lie l'abonnement au nouveau compte
-- Le champ expires_at permet un nettoyage manuel ou cron des entrées périmées (TTL 1h)
CREATE TABLE IF NOT EXISTS public.pending_stripe_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id text NOT NULL UNIQUE,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan_name text NOT NULL CHECK (plan_name IN ('start', 'scale', 'team')),
  price_id text NOT NULL,
  user_identifier text,  -- email ou claim transmis via metadata Stripe pour link post-création
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '1 hour'),
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.pending_stripe_links IS 'Sessions Stripe Checkout en attente de création de compte — TTL 1h';
COMMENT ON COLUMN public.pending_stripe_links.stripe_session_id IS 'Session ID Stripe Checkout — clé de recherche webhook';
COMMENT ON COLUMN public.pending_stripe_links.user_identifier IS 'Email/transient user ID pour link post-signup';
COMMENT ON COLUMN public.pending_stripe_links.expires_at IS 'Expiration automatique — nettoyage manuel ou cron recommandé';
