-- Table message_usage : compteur de messages utilisés par période mensuelle
-- Une ligne par utilisateur par mois (period_start = 1er du mois)
-- Reset automatique à chaque nouvelle période via date_trunc('month', created_at)
CREATE TABLE IF NOT EXISTS public.message_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  messages_used integer NOT NULL DEFAULT 0 CHECK (messages_used >= 0),
  period_start date NOT NULL,  -- 1er jour du mois (UTC), mis à jour chaque nouveau mois
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, period_start)
);

COMMENT ON TABLE public.message_usage IS 'Compteur de messages utilisés par période mensuelle';
COMMENT ON COLUMN public.message_usage.user_id IS 'Référence vers auth.users';
COMMENT ON COLUMN public.message_usage.messages_used IS 'Nombre de messages consommés ce mois';
COMMENT ON COLUMN public.message_usage.period_start IS '1er jour du mois UTC — clé de partitioning mensuel';
