// ============================================================
// Stripe config — lazy init pattern (never top-level throw)
// ============================================================
import Stripe from 'stripe'

export type StripePlanId = 'start' | 'scale' | 'team'

interface PlanConfig {
  id: StripePlanId
  /** Nom affiché dans l'UI */
  name: string
  /** Price ID Stripe (env var) */
  priceId: string
  /** Limite mensuelle de messages */
  messagesLimit: number
  /** Prix HT en euros — utilisé pour le success_url label */
  priceEur: number
}

const PLANS: Record<StripePlanId, PlanConfig> = {
  start: {
    id: 'start',
    name: 'Start',
    priceId: process.env.STRIPE_PRICE_ID_START ?? '',
    messagesLimit: 10,
    priceEur: 0,
  },
  scale: {
    id: 'scale',
    name: 'Scale',
    priceId: process.env.STRIPE_PRICE_ID_SCALE ?? '',
    messagesLimit: 50,
    priceEur: 0,
  },
  team: {
    id: 'team',
    name: 'Team',
    priceId: process.env.STRIPE_PRICE_ID_TEAM ?? '',
    messagesLimit: 100,
    priceEur: 0,
  },
}

// ── Lazy Stripe instance ──────────────────────────────────────
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (_stripe) return _stripe
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  // No apiVersion → SDK uses its default, avoids version drift
  _stripe = new Stripe(key)
  return _stripe
}

// ── Plan helpers ──────────────────────────────────────────────
export function isValidPlanId(plan: string): plan is StripePlanId {
  return plan === 'start' || plan === 'scale' || plan === 'team'
}

export function getPlanConfig(planId: StripePlanId): PlanConfig {
  return PLANS[planId]
}

export function getPlanMessageLimit(planId: StripePlanId): number {
  return PLANS[planId].messagesLimit
}

export function getPlanPriceId(planId: StripePlanId): string {
  return PLANS[planId].priceId
}

/** Returns all plan IDs — for validation loops */
export const PLAN_IDS: StripePlanId[] = ['start', 'scale', 'team']
