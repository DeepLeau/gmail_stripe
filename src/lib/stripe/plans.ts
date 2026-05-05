/**
 * src/lib/stripe/plans.ts
 *
 * Définition canonique des plans Stripe pour le frontend.
 * Shape aligné sur ce qu'attend Pricing.tsx (description, messagesLimit, features, price).
 * Les limites de units sont lues depuis config.ts pour éviter la duplication.
 */
import { STRIPE_PLANS, getPriceId, type StripePlanName } from '@/lib/stripe/config'

export interface PlanFeature {
  text: string
  included: boolean
}

export interface PlanEntry {
  id: StripePlanName
  displayName: string
  description: string
  price: string
  priceId: string
  messagesLimit: number
  features: PlanFeature[]
  highlighted: boolean
  badge?: string
}

const FREE_FEATURES: PlanFeature[] = [
  { text: '100 messages / mois', included: true },
  { text: '1 boîte mail connectée', included: true },
  { text: 'Résumés de threads', included: true },
  { text: 'Recherche en langage naturel', included: true },
  { text: 'Multi-comptes', included: false },
  { text: 'Priorité de traitement', included: false },
]

const PAID_FEATURES: PlanFeature[] = [
  { text: 'Messages illimités', included: true },
  { text: 'Plusieurs boîtes mail', included: true },
  { text: 'Résumés de threads', included: true },
  { text: 'Recherche en langage naturel', included: true },
  { text: 'Multi-comptes', included: true },
  { text: 'Priorité de traitement', included: true },
]

export const PLANS: PlanEntry[] = [
  {
    id: 'start',
    displayName: 'Start',
    description: 'Pour découvrir Emind sans engagement.',
    price: '9 €',
    priceId: getPriceId('start'),
    messagesLimit: STRIPE_PLANS.start.unitsLimit,
    features: [
      { text: `${STRIPE_PLANS.start.unitsLimit} messages / mois`, included: true },
      { text: '1 boîte mail connectée', included: true },
      { text: 'Résumés de threads', included: true },
      { text: 'Recherche en langage naturel', included: true },
      { text: 'Multi-comptes', included: false },
      { text: 'Priorité de traitement', included: false },
    ],
    highlighted: false,
  },
  {
    id: 'scale',
    displayName: 'Scale',
    description: 'Pour les professionnels qui vivent dans leurs emails.',
    price: '29 €',
    priceId: getPriceId('scale'),
    messagesLimit: STRIPE_PLANS.scale.unitsLimit,
    features: PAID_FEATURES.map(f => {
      if (f.text === 'Messages illimités') {
        return { text: `${STRIPE_PLANS.scale.unitsLimit} messages / mois`, included: true }
      }
      return f
    }),
    highlighted: true,
    badge: 'Recommandé',
  },
  {
    id: 'team',
    displayName: 'Team',
    description: 'Pour les équipes qui partagent des boîtes mail.',
    price: '79 €',
    priceId: getPriceId('team'),
    messagesLimit: STRIPE_PLANS.team.unitsLimit,
    features: PAID_FEATURES.map(f => {
      if (f.text === 'Messages illimités') {
        return { text: `${STRIPE_PLANS.team.unitsLimit} messages / mois`, included: true }
      }
      return f
    }),
    highlighted: false,
  },
]

export function getPlanBySlug(slug: string): PlanEntry | null {
  return PLANS.find(p => p.id === slug) ?? null
}
