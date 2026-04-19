/**
 * Configuration des plans Stripe — catalogue synchronisé avec la DB Supabase.
 *
 * Les stripe_price_id DOIVENT correspondre aux Price IDs créés dans le dashboard Stripe.
 * Après création des Price dans Stripe Dashboard :
 *   1. Récupérer les IDs (price_xxx)
 *   2. Les insérer dans la table public.plans via migration SQL
 *   3. Les reporter ici pour cohérence avec le code serveur
 *
 * Usage :
 *   - server side : lire depuis Supabase (source de vérité)
 *   - client side : afficher les noms/prix depuis cette config ou via API /api/subscription
 */
export type PlanName = 'start' | 'scale' | 'team'

export interface PlanConfig {
  name: PlanName
  displayName: string
  stripePriceId: string
  priceCents: number
  messagesPerMonth: number
}

export const PLANS: PlanConfig[] = [
  {
    name: 'start',
    displayName: 'Start',
    stripePriceId: 'price_start_monthly',
    priceCents: 1000,
    messagesPerMonth: 10,
  },
  {
    name: 'scale',
    displayName: 'Scale',
    stripePriceId: 'price_scale_monthly',
    priceCents: 2900,
    messagesPerMonth: 50,
  },
  {
    name: 'team',
    displayName: 'Team',
    stripePriceId: 'price_team_monthly',
    priceCents: 4900,
    messagesPerMonth: 100,
  },
]

/**
 * Map name → PlanConfig — O(1) lookup.
 */
export const PLAN_BY_NAME = Object.fromEntries(
  PLANS.map((p) => [p.name, p])
) as Record<PlanName, PlanConfig>

/**
 * Map stripePriceId → PlanConfig — O(1) lookup dans le webhook.
 */
export const PLAN_BY_PRICE_ID = Object.fromEntries(
  PLANS.map((p) => [p.stripePriceId, p])
) as Record<string, PlanConfig>

/**
 * Vérifie qu'un planName est valide.
 */
export function isValidPlanName(name: string): name is PlanName {
  return name in PLAN_BY_NAME
}
