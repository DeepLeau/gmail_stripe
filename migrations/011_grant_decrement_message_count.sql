-- =====================================================
-- MIGRATION 11: Grant execute on decrement_message_count
-- Permet aux Server Actions côté client d'appeler la RPC.
-- La fonction SECURITY DEFINER s'exécute avec les droits
-- du définisseur, mais l'appelant doit pouvoir l'invoquer.
-- =====================================================
GRANT EXECUTE ON FUNCTION public.decrement_message_count(UUID)
TO authenticated;

COMMENT ON GRANT IS
    'Allow authenticated users to call decrement_message_count RPC.
     The function itself validates the user via auth.uid() and SECURITY DEFINER context.';
