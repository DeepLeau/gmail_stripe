-- Migration 1 — RPC pour lister les emails vérifiés des users
-- Usage : service_role appelle cette RPC pour alimenter l'envoi newsletter via Resend
-- Risque : aucun — fonction en lecture seule, nouveau schéma, pas de modification

-- 1. Supprimer la fonction existante si elle existe (idempotence)
DROP FUNCTION IF EXISTS auth.list_verified_user_emails_for_newsletter(uuid);

-- 2. Créer la fonction RPC
CREATE OR REPLACE FUNCTION auth.list_verified_user_emails_for_newsletter(
  p_last_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id    uuid,
  email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, pg_temp
STABLE
AS $$
BEGIN
  -- Retourne les users avec email confirmé, ordonnés par created_at ASC
  -- Pagination cursor-based sur id (plus stable que created_at pour les offsets)
  RETURN QUERY
  SELECT
    au.id,
    au.email
  FROM auth.users au
  WHERE
    -- Cursor-based pagination : on saute les ids <= last_id
    (p_last_id IS NULL OR au.id > p_last_id)
    -- Uniquement les users avec email vérifié
    AND au.email_confirmed_at IS NOT NULL
  ORDER BY au.id ASC
  -- Limite arbitraire pour éviter de retourner trop de lignes en une fois
  -- Le caller doit boucler avec le dernier id retourné pour paginer
  LIMIT 1000;
END;
$$;

-- 3. Révoquer l'exécution publique (SECURITY DEFINER = exécutable par tous par défaut)
REVOKE ALL ON FUNCTION auth.list_verified_user_emails_for_newsletter(uuid) FROM PUBLIC;

-- 4. Ne PAS grant à authenticated — cette fonction est réservée au service_role uniquement.
--    Sans grant, seul le service_role (qui bypass RLS) peut l'exécuter.
--    Si une RPC doit être accessible au service_role uniquement, on ne grant PAS à authenticated.

-- 5. Commentaire Doc
COMMENT ON FUNCTION auth.list_verified_user_emails_for_newsletter(uuid) IS
'Liste les emails vérifiés des users auth.users pour alimentation newsletter.
Prend un curseur optionnel (last_id) et retourne jusqu''à 1000 lignes.
Réservée au service_role uniquement — ne pas grant à authenticated.
Le caller (service_role) doit boucler avec le dernier id comme p_last_id jusqu''à épuisement.
Aucun logging interne — tracer via Resend Dashboard ou audit_log applicatif côté route handler.';

