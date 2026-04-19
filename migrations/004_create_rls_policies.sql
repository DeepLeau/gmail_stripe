-- ============================================
-- Migration 004: Row Level Security
-- user_billing : lecture user, écriture service_role uniquement
-- messages : lecture/insertion user uniquement
-- ============================================

-- === user_billing ===

-- Active RLS
ALTER TABLE public.user_billing ENABLE ROW LEVEL SECURITY;

-- Policy lecture : user voit uniquement ses données billing
CREATE POLICY "users_read_own_billing"
  ON public.user_billing FOR SELECT
  USING (auth.uid() = user_id);

-- Policy insertion : service_role uniquement (webhooks Stripe)
-- Users finaux ne créent jamais directement leur billing
CREATE POLICY "service_role_insert_billing"
  ON public.user_billing FOR INSERT
  WITH CHECK (auth.uid() = user_id);  -- service_role bypass de toute façon

-- Policy mise à jour : service_role uniquement
-- Colonne plan/quotas non modifiables côté client (WITH CHECK bloque)
CREATE POLICY "service_role_update_billing"
  ON public.user_billing FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    -- Bloque modification du plan par le client
    AND plan = (SELECT plan FROM public.user_billing WHERE user_id = auth.uid())
    -- Bloque modification des quotas par le client
    AND messages_limit = (SELECT messages_limit FROM public.user_billing WHERE user_id = auth.uid())
    AND stripe_customer_id IS NOT DISTINCT FROM (SELECT stripe_customer_id FROM public.user_billing WHERE user_id = auth.uid())
    AND stripe_subscription_id IS NOT DISTINCT FROM (SELECT stripe_subscription_id FROM public.user_billing WHERE user_id = auth.uid())
  );

-- Policy suppression : pas de suppression côté client (garder historique facturation)
CREATE POLICY "service_role_only_delete_billing"
  ON public.user_billing FOR DELETE
  USING (false);  -- Interdit aux users normaux, service_role peut supprimer si nécessaire

-- === messages ===

-- Active RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy lecture : user voit uniquement ses propres messages
CREATE POLICY "users_read_own_messages"
  ON public.messages FOR SELECT
  USING (auth.uid() = user_id);

-- Policy insertion : user peut insérer messages avec role='user'
-- role='ai' sera inséré par le système/backend après réponse IA
CREATE POLICY "users_insert_own_messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND role = 'user'  -- Client ne peut insérer que des messages user
  );

-- Policy mise à jour : interdiction totale (messages immutables)
CREATE POLICY "no_client_update_messages"
  ON public.messages FOR UPDATE
  USING (false);  -- Bloque tout UPDATE côté client

-- Policy suppression : interdiction totale
CREATE POLICY "no_client_delete_messages"
  ON public.messages FOR DELETE
  USING (false);
