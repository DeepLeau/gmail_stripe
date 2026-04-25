-- ============================================================
-- MIGRATION 003: Create RLS policies for subscriptions
-- Sécurisation: Client ne peut lire QUE son propre abonnement (et pending sans user_id)
--              INSERT/UPDATE côté client INTERDITS — passent par service_role (webhooks/api)
-- ============================================================

-- Policy 1: SELECT — Users can read their own subscription
-- Autorise: Lecture de son propre abonnement (user_id match) OU
--           lecture des abonnements pending sans user_id (stripe_session_id existe)
--           pour permettre le lookup post-checkout dans /api/checkout/return
CREATE POLICY "Users can read own subscription"
  ON public.subscriptions
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR (
      status = 'pending'
      AND stripe_session_id IS NOT NULL
      AND user_id IS NULL
    )
  );

-- Policy 2: INSERT — No client-side insert (service_role only via webhook/API routes)
-- Pattern: pas de policy = opération interdite pour les clients authentifiés
-- service_role bypass RLS automatiquement, les webhooks Stripe passent par service_role
CREATE POLICY "No client insert on subscriptions"
  ON public.subscriptions
  FOR INSERT
  WITH CHECK (false);

-- Policy 3: UPDATE — No client-side update (service_role only via webhook/API routes)
-- Pattern: USING (false) = interdiction explicite
-- Le client ne doit JAMAIS pouvoir modifier son abonnement (status, limites, dates)
-- Ces modifications passent par les webhooks Stripe (service_role)
CREATE POLICY "No client update on subscriptions"
  ON public.subscriptions
  FOR UPDATE
  USING (false)
  WITH CHECK (false);

-- Policy 4: DELETE — No client-side delete
CREATE POLICY "No client delete on subscriptions"
  ON public.subscriptions
  FOR DELETE
  USING (false);
