import Stripe from 'stripe'

// --- Plans Stripe ---
export const STRIPE_PLANS = {
  start: {
    id: 'start' as const,
    priceId: process.env.STRIPE_PRICE_ID_START ?? '',
    messagesLimit: 10,
    name: 'Start',
    price: 10,
  },
  scale: {
    id: 'scale' as const,
    priceId: process.env.STRIPE_PRICE_ID_SCALE ?? '',
    messagesLimit: 50,
    name: 'Scale',
    price: 29,
  },
  team: {
    id: 'team' as const,
    priceId: process.env.STRIPE_PRICE_ID_TEAM ?? '',
    messagesLimit: 100,
    name: 'Team',
    price: 59,
  },
} as const

export type StripePlanId = keyof typeof STRIPE_PLANS

export function isValidPlan(plan: string): plan is StripePlanId {
  return plan in STRIPE_PLANS
}

export function getPlanConfig(plan: StripePlanId) {
  return STRIPE_PLANS[plan]
}

// --- Lazy client Stripe ---
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
