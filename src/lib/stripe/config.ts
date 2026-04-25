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
  displayName: string
  priceId: string
  price: number
  messagesLimit: number
  description: string
  features: { label: string }[]
}

const PLANS: Record<StripePlanName, PlanConfig> = {
  start: {
    id: 'start',
    displayName: 'Start',
    priceId: process.env.STRIPE_PRICE_ID_START ?? '',
    price: 9,
    messagesLimit: 10,
    description: 'Pour les particuliers qui veulent un assistant email.',
    features: [
      { label: '10 messages / mois' },
      { label: '1 boîte mail connectée' },
      { label: 'Résumés de threads' },
      { label: 'Recherche en langage naturel' },
      { label: 'API access' },
    ],
  },
  scale: {
    id: 'scale',
    displayName: 'Scale',
    priceId: process.env.STRIPE_PRICE_ID_SCALE ?? '',
    price: 29,
    messagesLimit: 50,
    description: 'Pour les professionnels qui gèrent plusieurs boîtes email.',
    features: [
      { label: '50 messages / mois' },
      { label: 'Plusieurs boîtes mail' },
      { label: 'Résumés de threads' },
      { label: 'Recherche en langage naturel' },
      { label: 'API access' },
      { label: 'Custom integrations' },
    ],
  },
  team: {
    id: 'team',
    displayName: 'Team',
    priceId: process.env.STRIPE_PRICE_ID_TEAM ?? '',
    price: 99,
    messagesLimit: 100,
    description: 'Pour les équipes qui gèrent plusieurs boîtes email.',
    features: [
      { label: '100 messages / mois' },
      { label: 'Plusieurs boîtes mail' },
      { label: 'Résumés de threads' },
      { label: 'Recherche en langage naturel' },
      { label: 'API access' },
      { label: 'Custom integrations' },
      { label: 'Team features' },
    ],
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

export function getPlanDisplayName(plan: StripePlanName): string {
  return PLANS[plan].displayName
}
