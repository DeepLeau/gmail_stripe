-- ============================================================
-- Migration 001: Table user_subscriptions
-- Stocker les abonnements Stripe avec plan, limites de messages,
-- périodes de facturation et statuts. Table séparée pour isoler
-- les données billing sensibles (pas de policy UPDATE client possible).
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id                            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id            text,
  stripe_subscription_id         text,
  stripe_checkout_session_id     text,
  plan                          text NOT NULL DEFAULT 'start'
                                  CHECK (plan IN ('start', 'scale', 'team')),
  messages_limit                integer NOT NULL CHECK (messages_limit > 0),
  messages_used                 integer NOT NULL DEFAULT 0
                                  CHECK (messages_used >= 0),
  current_period_start          timestamptz,
  current_period_end            timestamptz,
  subscription_status           text NOT NULL DEFAULT 'inactive'
                                  CHECK (subscription_status IN ('inactive', 'active', 'past_due', 'canceled')),
  created_at                    timestamptz NOT NULL DEFAULT now(),
  updated_at                    timestamptz NOT NULL DEFAULT now()
);

-- Audit columns
ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

COMMIT;
