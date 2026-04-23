import Stripe from 'stripe'

// ── Lazy-initialized Stripe client (canonical pattern, stripe.md §2.2) ──
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

export type StripePlanName = 'start' | 'scale' | 'team'

export function isValidPlan(plan: string): plan is StripePlanName {
  return plan === 'start' || plan === 'scale' || plan === 'team'
}

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

export function getPriceId(plan: StripePlanName): string {
  return PLANS[plan].priceId
}

export function getPlanLimit(plan: StripePlanName): number {
  return PLANS[plan].messagesLimit
}
