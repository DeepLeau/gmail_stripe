/**
 * src/lib/stripe/config.ts
 *
 * Configuration Stripe — client côté serveur, helpers de plans et types partagés.
 *
 * NE PAS MODIFIER CE FICHIER MANUELLEMENT.
 * Régénéré par Kurtel à partir de templates/stripe/_shared/lib/stripe/config.ts.template
 */
import Stripe from 'stripe'

// ─── Types ───────────────────────────────────────────────────────────────────

export type StripePlanName = 'start' | 'scale' | 'team'

export type StripePlanId = string

export interface PlanConfig {
  id: StripePlanName
  priceId: string
  unitsLimit: number
  displayName: string
}

export interface SubscriptionData {
  plan: string | null
  units_used: number
  units_limit: number | null
  units_remaining: number | null
  status: string
}

// ─── Plans ────────────────────────────────────────────────────────────────────

const PLANS: Record<StripePlanName, PlanConfig> = {
  start: {
    id: 'start',
    priceId: process.env.STRIPE_START_PRICE_ID ?? '',
    unitsLimit: 100,
    displayName: 'Start',
  },
  scale: {
    id: 'scale',
    priceId: process.env.STRIPE_SCALE_PRICE_ID ?? '',
    unitsLimit: 500,
    displayName: 'Scale',
  },
  team: {
    id: 'team',
    priceId: process.env.STRIPE_TEAM_PRICE_ID ?? '',
    unitsLimit: 1000,
    displayName: 'Team',
  },
}

// ─── Labels (exposés pour l'UI) ──────────────────────────────────────────────

export const UNIT_LABEL = 'message'
export const UNIT_LABEL_PLURAL = 'messages'

// ─── Client Stripe lazy (règle skill : jamais au top-level) ──────────────────

let stripeInstance: Stripe | null = null

/**
 * Retourne le client Stripe. Instancié une seule fois à la première utilisation.
 * Throw au runtime (pas au build) si la clé secrète n'est pas configurée.
 */
export function getStripe(): Stripe {
  if (stripeInstance) return stripeInstance
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY is not set. ' +
        'Add it to your .env file (cf. .env.example).'
    )
  }
  stripeInstance = new Stripe(key)
  return stripeInstance
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function isValidPlan(plan: string): plan is StripePlanName {
  return plan === 'start' || plan === 'scale' || plan === 'team'
}

export function getPriceId(plan: StripePlanName): string {
  return PLANS[plan].priceId
}

export function getPlanLimit(plan: StripePlanName): number {
  return PLANS[plan].unitsLimit
}

export function getPlanDisplayName(plan: StripePlanName): string {
  return PLANS[plan].displayName
}

export function getAllPlans(): PlanConfig[] {
  return Object.values(PLANS)
}

export function getPlanById(id: StripePlanName): PlanConfig {
  return PLANS[id]
}

export function getPlanByPriceId(priceId: string): StripePlanName | null {
  const entry = Object.entries(PLANS).find(([, cfg]) => cfg.priceId === priceId)
  return entry ? (entry[0] as StripePlanName) : null
}
