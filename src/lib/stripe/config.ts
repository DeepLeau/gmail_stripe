import Stripe from 'stripe'

export type StripePlanName = 'start' | 'scale' | 'team'

export type Plan = {
  id: StripePlanName
  priceId: string
  messagesLimit: number
}

export const PLANS: Record<StripePlanName, Plan> = {
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

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (stripeInstance !== null) {
    return stripeInstance
  }
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  stripeInstance = new Stripe(key)
  return stripeInstance
}

export const getStripeClient = getStripe

export function isValidPlan(plan: string): plan is StripePlanName {
  return plan === 'start' || plan === 'scale' || plan === 'team'
}

export function getPriceId(plan: StripePlanName): string {
  return PLANS[plan].priceId
}

export function getPlanLimit(plan: StripePlanName): number {
  return PLANS[plan].messagesLimit
}
