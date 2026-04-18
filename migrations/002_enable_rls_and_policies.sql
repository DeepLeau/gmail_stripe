-- ============================================
-- Migration 002: Activation RLS et policies
-- Sécurité Row Level Security AVANT création index
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy SELECT: utilisateur lit son propre profil
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy UPDATE: utilisateur modifie son propre profil
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Policy INSERT: utilisateur crée son propre profil
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy DELETE: utilisateur supprime son propre profil
CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE USING (auth.uid() = id);
