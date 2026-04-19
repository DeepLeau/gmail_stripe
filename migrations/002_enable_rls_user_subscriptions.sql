-- Active RLS sur user_subscriptions AVANT de créer les policies
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy SELECT : user ne voit que son propre abonnement
CREATE POLICY "Users read own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Pas de policy INSERT/UPDATE/DELETE côté client
-- Les writes passent uniquement par le webhook Stripe via service_role
-- (service_role bypass RLS automatiquement)

COMMENT ON POLICY "Users read own subscription" ON public.user_subscriptions IS 'Lecture seule du propre abonnement';
