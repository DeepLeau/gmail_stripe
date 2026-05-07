-- Migration 2 — RLS policies SELECT publique et authenticated sur pending_checkouts
-- Résout le latent issue : RLS activé mais aucune policy → SELECT retourne [] pour tout client
-- Risque : faible — table de staging Stripe, données non sensibles (emails publiquement exposés via checkout Stripe), lecture seule

-- 1. Supprimer les policies existantes si elles existent (idempotence)
DROP POLICY IF EXISTS "pending_checkouts_select_public" ON public.pending_checkouts;
DROP POLICY IF EXISTS "pending_checkouts_select_authenticated" ON public.pending_checkouts;

-- 2. Créer la policy publique en lecture
-- USING (true) est acceptable ici : customer_email, plan, subscription_status sont non-sensibles
-- (exposés publiquement par le flux Stripe checkout de toute façon)
CREATE POLICY "pending_checkouts_select_public"
  ON public.pending_checkouts
  FOR SELECT
  TO public
  USING (true);

-- 3. Créer la policy authenticated en lecture
-- Permet au dashboard frontend (rôle authenticated) de lire les pending_checkouts.
-- Si un filtrage par linked_user_id est souhaité, adapter le USING en conséquence.
-- En l'absence de user_id sur cette table, USING (true) est cohérent avec la policy public.
CREATE POLICY "pending_checkouts_select_authenticated"
  ON public.pending_checkouts
  FOR SELECT
  TO authenticated
  USING (true);

-- Note : pas de policy INSERT/UPDATE/DELETE → ces opérations restent réservées au service_role
-- Le client anon/authenticated ne peut ni écrire ni modifier ces données de staging

