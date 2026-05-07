-- Migration 004 : Table user_roles séparée + suppression is_admin de profiles
-- Blockers corrigés :
-- [001 ligne ~27] — subquery WITH CHECK fragile, un client pouvait
--   contourner via un body SQL qui passe is_admin sans détection.
-- [003 ligne ~30] — USING (true) sur pending_checkouts donnait accès à
--   TOUT utilisateur authenticated (Stripe IDs exposés).
-- Risque: moyen — modification de schéma existant, idempotent via IF EXISTS/IF NOT EXISTS

-- =============================================================================
-- 1. Table user_roles (colonne sensible extraite de profiles)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member'
    CHECK (role IN ('member', 'admin', 'owner')),
  granted_at timestamptz NOT NULL DEFAULT now(),
  granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Index pour lookup rapide par role
CREATE INDEX IF NOT EXISTS idx_user_roles_role
  ON public.user_roles(role);

-- Index pour audit par granted_by
CREATE INDEX IF NOT EXISTS idx_user_roles_granted_by
  ON public.user_roles(granted_by)
  WHERE granted_by IS NOT NULL;

-- Policy SELECT — chaque user voit son propre rôle
CREATE POLICY "user_roles_select_own"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy INSERT — INTERDITE côté client (service_role only via /api/admin/grant)
-- Pas de policy INSERT créée → INSERT bloqué pour le client

-- Policy UPDATE — INTERDITE côté client
CREATE POLICY "user_roles_no_client_update"
  ON public.user_roles FOR UPDATE
  USING (false);

-- Policy DELETE — INTERDITE côté client
CREATE POLICY "user_roles_no_client_delete"
  ON public.user_roles FOR DELETE
  USING (false);

-- =============================================================================
-- 2. Helper is_admin() — SECURITY DEFINER pour bypasser la RLS de user_roles
--    depuis les policies qui en ont besoin (pending_checkouts, audit_log, etc.)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'owner')
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- =============================================================================
-- 3. Supprimer l'ancienne colonne is_admin de profiles
-- =============================================================================

-- Supprimer l'index sur is_admin (plus pertinent après suppression de la colonne)
DROP INDEX IF EXISTS idx_profiles_is_admin;

-- Supprimer la CHECK constraint sur is_admin
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_is_admin_check;

-- Supprimer la colonne is_admin
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS is_admin;

-- =============================================================================
-- 4. Supprimer et recréer la policy UPDATE sur profiles
--    (sans la subquery is_admin qui n'existe plus)
-- =============================================================================

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
-- Pas de colonnes sensibles dans profiles → le client peut modifier
-- display_name librement, id est protégé par la FK.

-- =============================================================================
-- 5. Corriger la policy SELECT sur pending_checkouts
--    Remplacer USING (true) par USING (public.is_admin())
--    => seul un user admin/owner peut lire les pending_checkouts
-- =============================================================================

DROP POLICY IF EXISTS "pending_checkouts_select_all" ON public.pending_checkouts;

CREATE POLICY "pending_checkouts_admin_only"
  ON public.pending_checkouts FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Pas de policies INSERT/UPDATE/DELETE créées → seul le service_role (webhooks Stripe)
-- peut écrire via les fonctions apply_subscription_change et link_stripe_session_to_user.
