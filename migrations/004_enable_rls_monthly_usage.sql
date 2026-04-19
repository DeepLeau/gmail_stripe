-- Active RLS sur monthly_usage AVANT de créer les policies
ALTER TABLE public.monthly_usage ENABLE ROW LEVEL SECURITY;

-- Policy SELECT : user ne voit que son propre compteur
CREATE POLICY "Users read own usage"
  ON public.monthly_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Pas de policy INSERT/UPDATE/DELETE côté client
-- Writes via service_role uniquement

COMMENT ON POLICY "Users read own usage" ON public.monthly_usage IS 'Lecture seule du propre compteur';
