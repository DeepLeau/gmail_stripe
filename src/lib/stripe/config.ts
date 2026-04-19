/**
 * Stripe configuration — lazy initialization pattern.
 * The client is instantiated at runtime inside getStripe(),
 * never at module load time, to avoid build-time crashes
 * when environment variables are not yet available.
 */
import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

/**
 * Returns the Stripe client singleton.
 * Throws if STRIPE_SECRET_KEY is not set — fail fast at runtime.
 */
export function getStripe(): Stripe {
  if (stripeInstance) return stripeInstance

  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }

  // No apiVersion — let the SDK use its default version
  stripeInstance = new Stripe(key)
  return stripeInstance
}

// ─────────────────────────────────────────────────────────────
// Plan configuration
// ─────────────────────────────────────────────────────────────

export type StripePlanName = 'start' | 'scale' | 'team'

interface PlanConfig {
  id: StripePlanName
  priceId: string
  messagesLimit: number
}

const PLANS: Record<StripePlanName, PlanConfig> = {
  start: {
    id: 'start',
    priceId: process.env.STRIPE_PRICE_START ?? '',
    messagesLimit: 10,
  },
  scale: {
    id: 'scale',
    priceId: process.env.STRIPE_PRICE_SCALE ?? '',
    messagesLimit: 50,
  },
  team: {
    id: 'team',
    priceId: process.env.STRIPE_PRICE_TEAM ?? '',
    messagesLimit: 100,
  },
}

export function isValidPlan(plan: string): plan is StripePlanName {
  return plan === 'start' || plan === 'scale' || plan === 'team'
}

export function getPriceId(plan: StripePlanName): string {
  return PLANS[plan].priceId
}

export function getPlanLimit(plan: StripePlanName): number {
  return PLANS[plan].messagesLimit
}
