-- Table du compteur mensuel de messages
-- user_id = PK pour correspondre à user_subscriptions (relation 1:1)
-- Les DEFAULT sur current_period_start/end initialisent au mois courant
CREATE TABLE IF NOT EXISTS public.monthly_usage (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  messages_sent integer NOT NULL DEFAULT 0 CHECK (messages_sent >= 0),
  messages_limit integer NOT NULL DEFAULT 0 CHECK (messages_limit >= 0),
  current_period_start timestamptz NOT NULL DEFAULT date_trunc('month', now()),
  current_period_end timestamptz NOT NULL DEFAULT (date_trunc('month', now()) + interval '1 month'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index pour requêtes "quasi-quota" (avertissement à 90%)
CREATE INDEX IF NOT EXISTS idx_monthly_usage_usage_ratio
  ON public.monthly_usage (user_id)
  WHERE messages_sent >= messages_limit * 9 / 10;

COMMENT ON TABLE public.monthly_usage IS 'Compteur mensuel de messages envoyés par utilisateur';
