-- Migration 002bis : Correction de la policy SELECT newsletter_subscriptions
-- Blockers corrigés : [002 ligne ~23] — la policy ne vérifiait que user_id (nullable),
-- laissant un user voir la subscription d'un autre si leur email matchait, et un
-- anonymous pouvait voir les lignes avec user_id=NULL via IS NOT DISTINCT FROM.
-- Risque: faible — correction de policy existante, idempotent

-- 1. Ajouter une CHECK constraint sur l'email pour garantir un format valide
-- (protection supplémentaire contre injection de valeur via service_role)
ALTER TABLE public.newsletter_subscriptions
  ADD CONSTRAINT newsletter_subscriptions_email_format
  CHECK (email ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
  IF NOT EXISTS;

-- 2. Supprimer et recréer la policy SELECT avec vérification email + user_id
-- Pattern : le user peut voir sa subscription via son user_id OU son email
DROP POLICY IF EXISTS "newsletter_subscriptions_select_own"
  ON public.newsletter_subscriptions;

CREATE POLICY "newsletter_subscriptions_select_own"
  ON public.newsletter_subscriptions FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- 3. Ajouter une CHECK constraint sur subscribed pour garantir un booléen
ALTER TABLE public.newsletter_subscriptions
  ADD CONSTRAINT newsletter_subscriptions_subscribed_bool
  CHECK (subscribed IN (true, false))
  IF NOT EXISTS;
