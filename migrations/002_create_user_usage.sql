-- Migration: 002_create_user_usage.sql
-- Création de la table user_usage pour le compteur de messages mensuel
-- L'utilisateur peut incrémenter son compteur via UPDATE, mais pas le réinitialiser
-- La réinitialisation se fait via trigger sur changement de period_start

-- 1. Table principale user_usage
CREATE TABLE IF NOT EXISTS public.user_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  messages_used integer NOT NULL DEFAULT 0 CHECK (messages_used >= 0),
  period_start timestamptz NOT NULL DEFAULT date_trunc('month', now()),
  period_end timestamptz NOT NULL DEFAULT date_trunc('month', now()) + interval '1 month' - interval '1 second',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_period UNIQUE (user_id, period_start)
);

-- 2. Index composite pour requêtes rapides par utilisateur et période
CREATE INDEX IF NOT EXISTS idx_user_usage_user_period
  ON public.user_usage(user_id, period_start DESC);

-- 3. Index pour requêtes sur période courante (filtrage actif)
CREATE INDEX IF NOT EXISTS idx_user_usage_period_active
  ON public.user_usage(user_id, period_end DESC)
  WHERE period_end > now();

-- 4. Activation RLS
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

-- 5. Policy SELECT — utilisateur peut lire son propre usage
CREATE POLICY "Users read own usage"
  ON public.user_usage FOR SELECT
  USING (auth.uid() = user_id);

-- 6. Policy INSERT — utilisateur peut créer sa ligne d'usage (première utilisation)
-- WITH CHECK contraints : user_id correct, messages_used >= 0, period_start = période courante
CREATE POLICY "Users insert own usage"
  ON public.user_usage FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND messages_used >= 0
    AND period_start = date_trunc('month', now())
  );

-- 7. Policy UPDATE — PROTÉGÉE : incrémentation uniquement, pas de reset sauvage
-- USING : filtre les rows visibles (user voit uniquement les siennes)
-- WITH CHECK : valide les modifications — user_id et period_start figés via OLD,
--             messages_used ne peut que monter (comparaison directe, pas de sous-requête)
CREATE POLICY "Users update own usage"
  ON public.user_usage FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND user_id = OLD.user_id
    AND messages_used >= OLD.messages_used
    AND period_start = OLD.period_start
  );

-- 8. Policy DELETE — service_role only (pas de policy = interdiction côté client)
-- Les nettoyages de vieille donnée se font via tâche cron côté serveur

-- 9. Trigger updated_at automatique
CREATE OR REPLACE TRIGGER update_user_usage_updated_at
  BEFORE UPDATE ON public.user_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
