-- Activation RLS sur pending_stripe_links
-- Cette table est réservée au service_role (webhook Stripe + création de session côté serveur)
-- Aucun client (frontend) ne doit y accéder directement
ALTER TABLE public.pending_stripe_links ENABLE ROW LEVEL SECURITY;

-- Politique de lecture : service_role only — pas de policy pour les utilisateurs authentifiés
-- Pas de policy SELECT = SELECT interdit côté client
CREATE POLICY "no_client_select_pending_links"
  ON public.pending_stripe_links FOR SELECT
  USING (false);

-- Politique d'insertion : service_role only — création uniquement via API route serveur
CREATE POLICY "no_client_insert_pending_links"
  ON public.pending_stripe_links FOR INSERT
  WITH CHECK (false);

-- Pas de UPDATE/DELETE policy = operations interdites côté client
