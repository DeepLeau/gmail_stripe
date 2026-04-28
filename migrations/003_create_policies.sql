-- ============================================================
-- MIGRATION 003 — RLS pour user_subscriptions et pending_checkouts
-- Template: guest-subscription-quota
-- ============================================================

-- ─── user_subscriptions : policies standard ─────────────────────────────────
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_subscriptions_select_own" ON public.user_subscriptions;
DROP POLICY IF EXISTS "user_subscriptions_no_client_insert" ON public.user_subscriptions;
DROP POLICY IF EXISTS "user_subscriptions_no_client_update" ON public.user_subscriptions;
DROP POLICY IF EXISTS "user_subscriptions_no_client_delete" ON public.user_subscriptions;

CREATE POLICY "user_subscriptions_select_own"
  ON public.user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_subscriptions_no_client_insert"
  ON public.user_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "user_subscriptions_no_client_update"
  ON public.user_subscriptions
  FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "user_subscriptions_no_client_delete"
  ON public.user_subscriptions
  FOR DELETE
  TO authenticated
  USING (false);

-- ─── pending_checkouts : RLS strict ─────────────────────────────────────────
-- Aucune lecture/écriture côté client. Seul service_role (webhook) écrit,
-- seule la RPC link_stripe_session_to_user() lit (via SECURITY DEFINER).
ALTER TABLE public.pending_checkouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pending_checkouts_no_client_access" ON public.pending_checkouts;

-- Aucune policy positive = aucun accès pour authenticated/anon.
-- service_role bypass RLS, donc le webhook fonctionne.
-- La RPC SECURITY DEFINER fait son boulot avec les droits du créateur (postgres).

COMMENT ON TABLE public.pending_checkouts IS
  'Staging table — accessible only via service_role (webhook) and SECURITY DEFINER RPCs (link_stripe_session_to_user).';
