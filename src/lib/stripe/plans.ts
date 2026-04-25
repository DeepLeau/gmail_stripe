import type { StripePlanName } from './config'

export type PlanName = StripePlanName

export interface Plan {
  name: PlanName
  price: number
  messagesLimit: number
  description: string
  features: { label: string }[]
  upgradeTo?: PlanName
}

export const PLANS: Plan[] = [
  {
    name: 'start',
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
    upgradeTo: 'scale',
  },
  {
    name: 'scale',
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
    upgradeTo: 'team',
  },
  {
    name: 'team',
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
]

export function getPlanName(planId: string): PlanName | 'Free' {
  if (planId === 'start' || planId === 'scale' || planId === 'team') {
    return planId
  }
  return 'Free'
}

export function getFreePlan(): { name: string; messagesLimit: number; upgradeTo?: PlanName } {
  return {
    name: 'Free',
    messagesLimit: 10,
    upgradeTo: 'start',
  }
}
