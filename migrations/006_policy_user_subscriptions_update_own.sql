-- =============================================================================
-- MIGRATION 006: Policy UPDATE - utilisateur ne peut pas modifier les colonnes sensibles
-- Les RPCs utilisent SECURITY DEFINER pour contourner cette restriction si nécessaire
-- =============================================================================

CREATE POLICY "user_subscriptions_own_update"
  ON public.user_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    -- Colonnes sensibles : figées, non modifiables côté client
    AND plan = (SELECT plan FROM public.user_subscriptions WHERE user_id = auth.uid())
    AND messages_limit = (SELECT messages_limit FROM public.user_subscriptions WHERE user_id = auth.uid())
    AND subscription_status = (SELECT subscription_status FROM public.user_subscriptions WHERE user_id = auth.uid())
    -- messages_used : modification directe interdite, passe par decrement_message_count()
    AND messages_used = (SELECT messages_used FROM public.user_subscriptions WHERE user_id = auth.uid())
  );

COMMENT ON POLICY user_subscriptions_own_update 
  ON public.user_subscriptions IS 
  'Interdit la modification des colonnes sensibles (plan, limits, status, messages_used) côté client';
