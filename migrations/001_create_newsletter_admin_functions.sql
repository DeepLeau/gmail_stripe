-- Migration newsletter admin : fonction RPC + audit log
-- Objectif : permettre l'envoi de newsletters en masse via Resend depuis un espace admin

-- ══════════════════════════════════════════════════════════════
-- TABLE audit_log — traçabilité des actions sensibles
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.newsletter_audit_log (
  id bigserial PRIMARY KEY,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  admin_email text NOT NULL,
  subject text NOT NULL,
  recipient_count integer NOT NULL,
  status text NOT NULL CHECK (status IN ('success', 'partial_failure', 'failed')),
  error_detail text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE public.newsletter_audit_log ENABLE ROW LEVEL SECURITY;

-- Lecture : admins uniquement (via helper is_admin())
CREATE POLICY "Admins can read newsletter audit log"
  ON public.newsletter_audit_log FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Écriture : service_role uniquement (webhook, scripts serveur)
CREATE POLICY "Service role can insert newsletter audit log"
  ON public.newsletter_audit_log FOR INSERT
  WITH CHECK (true);

-- Pas de UPDATE/DELETE → logs immutables

-- ══════════════════════════════════════════════════════════════
-- FONCTION list_users_for_newsletter
-- Retourne id, email, created_at des users actifs avec email
-- SECURITY DEFINER pour bypasser la RLS de auth.users
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.list_users_for_newsletter()
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
BEGIN
  -- Validation : vérifier que le caller est authentifié
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Vérification admin via le helper is_admin()
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT
    au.id,
    au.email::text,
    au.created_at
  FROM auth.users au
  WHERE au.email IS NOT NULL
    AND au.email != ''
    AND au.confirmed_at IS NOT NULL
  ORDER BY au.created_at ASC;
END;
$$;

REVOKE ALL ON FUNCTION public.list_users_for_newsletter() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_users_for_newsletter() TO authenticated;

-- ══════════════════════════════════════════════════════════════
-- POLICY RLS sur auth.users (complémentaire à la RPC)
-- Autorise le service_role à lire auth.users pour listUsers()
-- Note : auth.users est une table système Supabase — la policy
-- s'applique uniquement côté service_role bypassant RLS
-- ══════════════════════════════════════════════════════════════

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Policy de lecture pour le service_role uniquement
-- auth.role() = 'service_role' est vrai uniquement quand la requête
-- est faite avec SUPABASE_SERVICE_ROLE_KEY (jamais côté client)
CREATE POLICY "auth_users_read_service_role"
  ON auth.users FOR SELECT
  TO authenticated
  USING (auth.role() = 'service_role');

COMMENT ON POLICY "auth_users_read_service_role" ON auth.users IS
  'Permet au service_role de lister les users pour la fonctionnalité newsletter admin. N''autorise pas les clients publics.';
