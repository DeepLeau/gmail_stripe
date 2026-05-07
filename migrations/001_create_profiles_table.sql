-- Migration 001: Table profiles pour métadonnées utilisateur + flag is_admin
-- Risque: aucun — table standard avec RLS restrictive

-- 1. Table profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin boolean NOT NULL DEFAULT false CHECK (is_admin IN (false, true)),
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Index sur is_admin pour les queries admin rapides
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin
  ON public.profiles(is_admin)
  WHERE is_admin = true;

-- 3. Active RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Policy SELECT — chaque user lit sa propre profile
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 5. Policy UPDATE — chaque user modifie son display_name UNIQUEMENT
-- is_admin n'est PAS modifiable côté client (WITH CHECK freeze via subquery)
-- id est la PK, donc protégé naturellement par la FK — pas besoin de le geler via subquery
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND is_admin IS NOT DISTINCT FROM (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
  );

-- 6. Pas de policy INSERT/DELETE côté client — géré par trigger handle_new_user (service role)
