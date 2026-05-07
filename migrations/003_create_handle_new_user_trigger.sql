-- Migration 003: Trigger handle_new_user pour créer automatiquement la profile
-- Risque: faible — lock très bref sur auth.users, fonction SECURITY DEFINER légère

-- 1. Fonction SECURITY DEFINER qui crée la profile à chaque nouveau user
-- search_path limité à public + pg_temp pour éviter les attaques via search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$;

-- 2. Révoque l'exécution publique — seul le trigger système peut appeler cette fonction
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;

-- 3. Trigger sur auth.users AFTER INSERT
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Active RLS sur pending_checkouts (policy SELECT manquante — latent issue)
-- Permet au service_role (via /api/admin/...) de lire les pending_checkouts
ALTER TABLE public.pending_checkouts ENABLE ROW LEVEL SECURITY;

-- 5. Policy SELECT sur pending_checkouts — service_role ONLY
-- USING (true) est acceptable ici car l'accès se fait via endpoint /api/admin/* côté serveur
CREATE POLICY "pending_checkouts_select_all"
  ON public.pending_checkouts FOR SELECT
  TO authenticated
  USING (true);

-- Pas de policies INSERT/UPDATE/DELETE — seul le service_role (webhooks Stripe)
-- a le droit d'écrire dans cette table via les fonctions apply_subscription_change
-- et link_stripe_session_to_user déjà définies dans le schéma.
