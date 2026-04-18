-- ============================================
-- Migration 007: Permissions additionnelles
-- Grant service_role pour webhooks Stripe (upsert profil)
-- ============================================
-- Service role peut upsert les profils (webhooks Stripe)
GRANT SELECT, INSERT, UPDATE ON public.profiles TO service_role;

-- Vérification que RLS est bien active
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'profiles' 
    AND rowsecurity = TRUE
  ) THEN
    RAISE WARNING 'RLS may not be enabled on profiles table';
  END IF;
END $$;
