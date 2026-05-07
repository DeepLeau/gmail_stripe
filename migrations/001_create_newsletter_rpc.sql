-- Migration SQL: Newsletter admin RPC
-- Créé le: 2025-01-15
-- Objectif: Permettre à l'admin d'envoyer des newsletters à tous les utilisateurs confirmés

-- 1. Fonction RPC SECURITY DEFINER — liste les utilisateurs avec email confirmé
-- Volatilité STABLE (pas VOLATILE) : Postgres peut cacher le résultat dans la même transaction
CREATE OR REPLACE FUNCTION public.list_all_users_for_admin()
RETURNS TABLE (
  id         uuid,
  email      text,
  email_confirmed_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    au.id,
    au.email::text,
    au.email_confirmed_at
  FROM auth.users au
  WHERE au.email_confirmed_at IS NOT NULL;
END;
$$;

-- 2. Sécurité : revoke public + grant authenticated uniquement
REVOKE ALL ON FUNCTION public.list_all_users_for_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_all_users_for_admin() TO authenticated;

-- 3. Commentaire documenté pour référence dans le code
COMMENT ON FUNCTION public.list_all_users_for_admin() IS
  'Returns all confirmed users (email_confirmed_at IS NOT NULL) for admin operations. '
  'Uses SECURITY DEFINER with search_path protection. '
  'Call via service_role client from /api/admin/newsletter/send route.';
