export type StripePlanName = 'start' | 'scale' | 'team'

export interface PlanConfig {
  slug: StripePlanName
  name: string
  description: string
  price: string
  period: string
  badge?: string
  messagesPerMonth: number
  features: Array<{ text: string; included: boolean }>
  cta: string
  highlighted: boolean
}

export const PLANS: PlanConfig[] = [
  {
    slug: 'start',
    name: 'Start',
    description: 'Pour découvrir Emind sans engagement.',
    price: '0 €',
    period: 'mois',
    messagesPerMonth: 50,
    features: [
      { text: '50 messages / mois', included: true },
      { text: '1 boîte mail connectée', included: true },
      { text: 'Résumés de threads', included: true },
      { text: 'Recherche en langage naturel', included: true },
      { text: 'Multi-comptes', included: false },
      { text: 'Priorité de traitement', included: false },
    ],
    cta: 'Commencer gratuitement',
    highlighted: false,
  },
  {
    slug: 'scale',
    name: 'Scale',
    description: 'Pour les professionnels qui gèrent plusieurs boîtes email.',
    price: '19 €',
    period: 'mois',
    badge: 'Recommandé',
    messagesPerMonth: 200,
    features: [
      { text: '200 messages / mois', included: true },
      { text: 'Plusieurs boîtes mail', included: true },
      { text: 'Résumés de threads', included: true },
      { text: 'Recherche en langage naturel', included: true },
      { text: 'Multi-comptes', included: true },
      { text: 'Priorité de traitement', included: true },
    ],
    cta: 'Passer à Scale',
    highlighted: true,
  },
  {
    slug: 'team',
    name: 'Team',
    description: 'Pour les équipes qui ont besoin du maximum.',
    price: '49 €',
    period: 'mois',
    messagesPerMonth: 500,
    features: [
      { text: '500 messages / mois', included: true },
      { text: 'Boîtes mail illimitées', included: true },
      { text: 'Résumés de threads', included: true },
      { text: 'Recherche en langage naturel', included: true },
      { text: 'Multi-comptes', included: true },
      { text: 'Priorité de traitement', included: true },
      { text: 'Support dédié', included: true },
    ],
    cta: 'Passer à Team',
    highlighted: false,
  },
]

export function getPlanBySlug(slug: string): PlanConfig | undefined {
  return PLANS.find((p) => p.slug === slug)
}

export function getPlanByPriceId(_priceId: string): PlanConfig | undefined {
  // Price ID → plan mapping resolved via env vars in stripe/config.ts
  // This is a reverse lookup used by webhooks
  return undefined
}
