-- Activation RLS + Policies sur subscriptions
-- Ordre: ENABLE ROW LEVEL SECURITY avant CREATE POLICY (étape 7 du plan)

-- Activation RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLICY SELECT: utilisateur lit son propre abonnement
-- ============================================================
CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- POLICY INSERT: interdiction côté client
-- (service_role = webhook Stripe + endpoint /api/checkout/create-session)
-- ===
CREATE POLICY "subscriptions_insert_service_only"
  ON public.subscriptions
  FOR INSERT
  WITH CHECK (false);

-- ============================================================
-- POLICY UPDATE: limité au compteur messages_used uniquement
-- (incrémenté par /api/messages/send côté serveur)
-- Toutes les colonnes sensibles (plan, status, limits, stripe_*) sont figées
-- ===
CREATE POLICY "subscriptions_update_counter_only"
  ON public.subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    -- Colonnes non modifiables côté client: préserver les valeurs existantes
    AND plan_slug = (SELECT plan_slug FROM public.subscriptions WHERE id = public.subscriptions.id)
    AND status = (SELECT status FROM public.subscriptions WHERE id = public.subscriptions.id)
    AND messages_limit = (SELECT messages_limit FROM public.subscriptions WHERE id = public.subscriptions.id)
    AND stripe_customer_id IS NOT DISTINCT FROM (SELECT stripe_customer_id FROM public.subscriptions WHERE id = public.subscriptions.id)
    AND stripe_subscription_id IS NOT DISTINCT FROM (SELECT stripe_subscription_id FROM public.subscriptions WHERE id = public.subscriptions.id)
    -- messages_used: seul champ modifiable par le client (incrément compteur)
  );

-- ============================================================
-- POLICY DELETE: interdiction côté client
-- (service_role = endpoint /api/subscription/cancel après webhook stripe)
-- ===
CREATE POLICY "subscriptions_delete_service_only"
  ON public.subscriptions
  FOR DELETE
  USING (false);
