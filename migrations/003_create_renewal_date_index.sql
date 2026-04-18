-- ============================================
-- Migration 003: Index partial sur renewal_date
-- Optimisation cron job scanne profils à réinitialiser
-- NOTE: Index non-CONCURRENT car créé après ENABLE RLS
-- (pas de conflit avec transaction Supabase ici)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_renewal_date 
  ON public.profiles (renewal_date) 
  WHERE renewal_date IS NOT NULL;
