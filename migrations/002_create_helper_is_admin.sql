-- Migration helper is_admin() — prérequis pour newsletter_audit_log
-- Table user_roles + helper SECURITY DEFINER pour vérifier le rôle admin

-- ══════════════════════════════════════════════════════════════
-- TABLE user_roles — stockage non-modifiable côté client
-- Les rôles sont attribués uniquement via service_role (webhooks, scripts ops)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin', 'owner')),
  granted_at timestamptz NOT NULL DEFAULT now(),
  granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Lecture : chaque user voit son propre rôle
CREATE POLICY "Users read own role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Pas de INSERT/UPDATE/DELETE policy → seul le service_role peut écrire

-- ══════════════════════════════════════════════════════════════
-- FONCTION is_admin() — helper SECURITY DEFINER
-- Utilisé par les policies RLS pour vérifier le rôle sans subir la RLS
-- Retourne true si l'user courant a un rôle admin/owner
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

COMMENT ON FUNCTION public.is_admin() IS
  'Helper RLS pour vérifier si l''utilisateur courant a un rôle admin ou owner.';
