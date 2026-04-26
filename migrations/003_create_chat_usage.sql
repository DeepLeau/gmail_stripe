-- Table dénormalisée pour le compteur de messages par période mensuelle
-- Source de vérité pour le compteur ; user_billing.messages_used est une dénormalisation
-- Contrainte UNIQUE sur (user_id, period_start) = une ligne par user par mois
CREATE TABLE IF NOT EXISTS public.chat_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start date NOT NULL,  -- premier jour du mois (ex: 2024-01-01)
  messages_used integer NOT NULL DEFAULT 0 CHECK (messages_used >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, period_start)
);

ALTER TABLE public.chat_usage ENABLE ROW LEVEL SECURITY;

-- Index composite pour requêtes "messages du user X ce mois-ci"
CREATE INDEX IF NOT EXISTS idx_chat_usage_user_period
  ON public.chat_usage(user_id, period_start DESC);

-- Index sur period_start pour queries cross-user par mois (stats admin)
CREATE INDEX IF NOT EXISTS idx_chat_usage_period
  ON public.chat_usage(period_start);
