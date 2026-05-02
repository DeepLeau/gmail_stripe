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

export type StripePlanName = 'free' | 'starter' | 'growth' | 'pro'

export interface PlanConfig {
  slug: StripePlanName
  name: string
  priceNumeric: number
  unitsLimit: number
  unit: string
  description: string
  features: string[]
  cta: string
  highlighted: boolean
}

export const PLAN_RECORDS: Record<StripePlanName, PlanConfig> = {
  free: {
    slug: 'free',
    name: 'Free',
    priceNumeric: 0,
    unitsLimit: 0,
    unit: 'message',
    description: 'Pour découvrir Emind sans engagement.',
    features: [
      '0 message / mois',
      '1 boîte email connectée',
      'Réponses en 10 secondes',
    ],
    cta: 'Commencer gratuitement',
    highlighted: false,
  },
  starter: {
    slug: 'starter',
    name: 'Starter',
    priceNumeric: 9,
    unitsLimit: 50,
    unit: 'message',
    description: 'Pour les besoins modestes.',
    features: [
      '50 messages / mois',
      '1 boîte email connectée',
      'Réponses en 10 secondes',
      'Support par email',
    ],
    cta: 'Choisir Starter',
    highlighted: false,
  },
  growth: {
    slug: 'growth',
    name: 'Growth',
    priceNumeric: 29,
    unitsLimit: 200,
    unit: 'message',
    description: 'Pour les utilisateurs actifs.',
    features: [
      '200 messages / mois',
      '3 boîtes email',
      'Réponses en 5 secondes',
      'Support prioritaire',
    ],
    cta: 'Choisir Growth',
    highlighted: true,
  },
  pro: {
    slug: 'pro',
    name: 'Pro',
    priceNumeric: 79,
    unitsLimit: 1000,
    unit: 'message',
    description: 'Pour les professionals intensifs.',
    features: [
      '1 000 messages / mois',
      'Boîtes email illimitées',
      'Réponses en 3 secondes',
      'Support prioritaire',
    ],
    cta: 'Choisir Pro',
    highlighted: false,
  },
}

export function isValidPlan(plan: string): plan is StripePlanName {
  return plan === 'free' || plan === 'starter' || plan === 'growth' || plan === 'pro'
}

export function getPriceId(plan: StripePlanName): string {
  if (plan === 'free') return ''
  const envMap: Record<StripePlanName, string> = {
    free: '',
    starter: process.env.STRIPE_STARTER_PRICE_ID ?? '',
    growth: process.env.STRIPE_GROWTH_PRICE_ID ?? '',
    pro: process.env.STRIPE_PRO_PRICE_ID ?? '',
  }
  return envMap[plan]
}

export function getPlanUnits(plan: StripePlanName): number {
  return PLAN_RECORDS[plan]?.unitsLimit ?? 0
}

export const stripePlans: PlanConfig[] = [
  PLAN_RECORDS.free,
  PLAN_RECORDS.starter,
  PLAN_RECORDS.growth,
  PLAN_RECORDS.pro,
]
