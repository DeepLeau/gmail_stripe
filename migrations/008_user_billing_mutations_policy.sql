-- Policies INSERT/UPDATE/DELETE restrictives sur user_billing pour service_role uniquement
-- Ces operations sont interdites côté client (pas de policy = operation refusée par défaut)
-- service_role (webhooks Stripe, API routes Server Actions) bypass RLS et peut écrire
-- 
-- INSERT : création de ligne lors du premier abonnement (webhook ou upgrade endpoint)
--         Seul le service_role peut insérer ; client n'a pas accès à cette policy
-- UPDATE : mise à jour plan/status par webhook Stripe uniquement
-- DELETE : désabonnement ou suppression compte (cascade FK → ON DELETE CASCADE sur user_id)

CREATE POLICY "Service role only inserts billing"
  ON public.user_billing FOR INSERT
  WITH CHECK (false);  -- tout client est refusé ; service_role bypass

CREATE POLICY "Service role only updates billing"
  ON public.user_billing FOR UPDATE
  USING (false);      -- tout client est refusé ; service_role bypass

CREATE POLICY "Service role only deletes billing"
  ON public.user_billing FOR DELETE
  USING (false);      -- tout client est refusé ; service_role bypass
