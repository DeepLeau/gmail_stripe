-- Seed des 3 plans initiaux (idempotent via ON CONFLICT DO NOTHING)
-- Risque: aucune (INSERT avec DO NOTHING, données de référence)

INSERT INTO public.plans (name, slug, description, price_cents, billing_period, messages_limit, stripe_price_id)
VALUES
  (
    'Start',
    'start',
    '10 messages par mois',
    900,                                        -- 9,00 €
    'monthly',
    10,
    'price_start_placeholder'                  -- ⚠️ Remplacer par vrai price_id Stripe après setup dashboard
  ),
  (
    'Scale',
    'scale',
    '50 messages par mois',
    1900,                                       -- 19,00 €
    'monthly',
    50,
    'price_scale_placeholder'                  -- ⚠️ Remplacer par vrai price_id Stripe après setup dashboard
  ),
  (
    'Team',
    'team',
    '100 messages par mois',
    3900,                                       -- 39,00 €
    'monthly',
    100,
    'price_team_placeholder'                    -- ⚠️ Remplacer par vrai price_id Stripe après setup dashboard
  )
ON CONFLICT (slug) DO NOTHING;

-- Vérification post-migration
-- SELECT id, slug, name, price_cents, messages_limit FROM public.plans ORDER BY price_cents;
