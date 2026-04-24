-- Migration 003: Active RLS et crée les policies d'accès
-- RLS OBLIGATOIRE sur toute table contenant des données utilisateur
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy SELECT: utilisateur peut lire UNIQUEMENT sa propre ligne
-- USING filtre les lignes visibles, WITH CHECK valide après modification
CREATE POLICY "Users can read their own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy INSERT: reserved to service_role only (webhook handler)
-- Pas de policy INSERT créée → side client INSERT interdit par défaut
-- Seul service_role (bypass RLS) peut insérer

-- Policy UPDATE: reserved to service_role only (webhook handler)
-- Pas de policy UPDATE créée → side client UPDATE interdit par défaut
-- Seul service_role (bypass RLS) peut mettre à jour

-- Policy DELETE: reserved to service_role only
-- Pas de policy DELETE créée → side client DELETE interdit par défaut
-- Seul service_role (bypass RLS) peut supprimer
