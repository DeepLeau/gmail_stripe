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

interface PlanConfig {
  id: StripePlanName
  priceId: string
  messagesLimit: number
}

const PLANS: Record<StripePlanName, PlanConfig> = {
  start: {
    id: 'start',
    priceId: process.env.STRIPE_START_PRICE_ID ?? '',
    messagesLimit: 10,
  },
  scale: {
    id: 'scale',
    priceId: process.env.STRIPE_SCALE_PRICE_ID ?? '',
    messagesLimit: 50,
  },
  team: {
    id: 'team',
    priceId: process.env.STRIPE_TEAM_PRICE_ID ?? '',
    messagesLimit: 100,
  },
}

export const STRIPE_PLANS = PLANS

export type SubscriptionData = {
  plan: StripePlanName
  priceId: string
  messagesLimit: number
  isActive: boolean
}

export function isValidPlan(plan: string): plan is StripePlanName {
  return plan === 'start' || plan === 'scale' || plan === 'team'
    || plan === 'starter' || plan === 'growth' || plan === 'pro'
}

export function getPriceId(plan: StripePlanName): string {
  return PLANS[plan].priceId
}

export function getPlanLimit(plan: StripePlanName): number {
  return PLANS[plan].messagesLimit
}

export function getPlanByPriceId(priceId: string): StripePlanName | null {
  for (const [key, config] of Object.entries(PLANS)) {
    if (config.priceId === priceId) {
      return key as StripePlanName
    }
  }
  return null
}
