/**
 * src/lib/stripe/config.ts
 *
 * Configuration Stripe — lazy init du client + déclaration des plans.
 * Suit toutes les règles de skill stripe.md (§1, §2, §3, §8, §9).
 *
 * NE PAS MODIFIER CE FICHIER MANUELLEMENT.
 * Régénéré par Kurtel à partir de templates/stripe/_shared/lib/stripe/config.ts.template
 *
 * Pour ajouter/modifier un plan, mettre à jour le brief PM ou le meta.json du template.
 */
import Stripe from 'stripe'

// ─── Type des plans ─────────────────────────────────────────────────────────
export type StripePlanName = 'start' | 'scale' | 'team'

interface PlanConfig {
  id: StripePlanName
  priceId: string
  unitsLimit: number
  displayName: string
}

const PLANS: Record<StripePlanName, PlanConfig> = {
  start: { id: 'start', priceId: process.env.STRIPE_START_PRICE_ID ?? '', unitsLimit: 10, displayName: 'Start' },
  scale: { id: 'scale', priceId: process.env.STRIPE_SCALE_PRICE_ID ?? '', unitsLimit: 50, displayName: 'Scale' },
  team: { id: 'team', priceId: process.env.STRIPE_TEAM_PRICE_ID ?? '', unitsLimit: 100, displayName: 'Team' },
}

// ─── Client Stripe lazy (skill stripe.md §2.2) ──────────────────────────────
let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (stripeInstance) return stripeInstance
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  stripeInstance = new Stripe(key)
  return stripeInstance
}

// ─── Helpers (noms canoniques, skill stripe.md §3.2) ────────────────────────
export function isValidPlan(plan: string): plan is StripePlanName {
  return plan in PLANS
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

// Reverse lookup price_id → plan slug (utilisé par le webhook)
export function getPlanByPriceId(priceId: string): StripePlanName | null {
  for (const [slug, config] of Object.entries(PLANS)) {
    if (config.priceId === priceId) return slug as StripePlanName
  }
  return null
}

// ─── Unit label (messages, minutes, crédits...) ─────────────────────────────
export const UNIT_LABEL = 'message'
export const UNIT_LABEL_PLURAL = 'messages'
