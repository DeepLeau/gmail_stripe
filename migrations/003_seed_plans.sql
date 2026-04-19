-- ============================================
-- Migration 003: Insertion des 3 plans initiaux
-- ============================================
-- Plans pour le pricing page (MVP).
-- Risque: faible — INSERT idempotent avec ON CONFLICT DO NOTHING.
-- NOTE: stripe_price_id_monthly laissé NULL car les IDs Stripe doivent être
-- configurés manuellement dans le dashboard Stripe avant insertion.

-- Insertion des 3 plans via VALUES avec DO NOTHING pour idempotence
INSERT INTO public.plans (name, slug, description, price_cents, currency, stripe_price_id_monthly, messages_per_month, features, is_active)
VALUES
  (
    'start',
    'start',
    'Pour découvrir et commencer',
    1900,  -- 19.00 EUR
    'EUR',
    NULL,  -- À remplacer par le Price ID Stripe réel (price_xxx_monthly)
    10,
    '["Accès au chat IA", "10 messages/mois", "Support email"]'::jsonb,
    true
  ),
  (
    'scale',
    'scale',
    'Pour les professionnels et freelancers',
    4900,  -- 49.00 EUR
    'EUR',
    NULL,  -- À remplacer par le Price ID Stripe réel (price_xxx_monthly)
    50,
    '["Accès au chat IA", "50 messages/mois", "Support prioritaire", "Historique étendu"]'::jsonb,
    true
  ),
  (
    'team',
    'team',
    'Pour les équipes et entreprises',
    9900,  -- 99.00 EUR
    'EUR',
    NULL,  -- À remplacer par le Price ID Stripe réel (price_xxx_monthly)
    100,
    '["Accès au chat IA", "100 messages/mois", "Support dédié", "Multi-utilisateurs", "API access"]'::jsonb,
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  -- Réassigner les mêmes valeurs (idempotent) mais mettre à jour updated_at
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_cents = EXCLUDED.price_cents,
  currency = EXCLUDED.currency,
  messages_per_month = EXCLUDED.messages_per_month,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active,
  updated_at = now()
WHERE public.plans.slug = EXCLUDED.slug;
