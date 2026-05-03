/**
 * Configuration Stripe — constantes PLANS et client server-side
 *
 * Règles (skill Stripe) :
 * - getStripe() lazy init (pas d'instance au top-level)
 * - Pas d'apiVersion hardcodé
 * - Prix en centimes, limite message, singulier/pluriel
 */

import Stripe from 'stripe'

// ── Types ──────────────────────────────────────────────────────────────────────

export type StripePlanSlug = 'starter' | 'growth' | 'pro'

export interface StripePlan {
  id: StripePlanSlug
  label: string
  slug: StripePlanSlug
  priceCents: number
  priceLabel: string
  messagesLimit: number
  unitSingular: string
  unitPlural: string
  description: string
  features: string[]
  highlighted: boolean
  badge?: string
}

// ── Constantes PLANS ───────────────────────────────────────────────────────────

export const PLANS: Record<StripePlanSlug, StripePlan> = {
  starter: {
    id: 'starter',
    label: 'Starter',
    slug: 'starter',
    priceCents: 900, // 9 €
    priceLabel: '9 €',
    messagesLimit: 50,
    unitSingular: 'message',
    unitPlural: 'messages',
    description: 'Pour découvrir Emind et ses capacités.',
    features: [
      '50 messages / mois',
      '1 boîte email connectée',
      'Réponses en 10 secondes',
      'Support par email',
    ],
    highlighted: false,
  },
  growth: {
    id: 'growth',
    label: 'Growth',
    slug: 'growth',
    priceCents: 2900, // 29 €
    priceLabel: '29 €',
    messagesLimit: 200,
    unitSingular: 'message',
    unitPlural: 'messages',
    description: 'Pour les utilisateurs actifs qui optimisent leur temps.',
    features: [
      '200 messages / mois',
      '3 boîtes email connectées',
      'Réponses en 5 secondes',
      'Support prioritaire',
      'Analyses avancées',
    ],
    highlighted: true,
    badge: 'Recommandé',
  },
  pro: {
    id: 'pro',
    label: 'Pro',
    slug: 'pro',
    priceCents: 7900, // 79 €
    priceLabel: '79 €',
    messagesLimit: 1000,
    unitSingular: 'message',
    unitPlural: 'messages',
    description: 'Pour les power users et les petites équipes.',
    features: [
      '1 000 messages / mois',
      'Boîtes email illimitées',
      'Réponses en 3 secondes',
      'Support dédié',
      'Accès anticipé aux nouvelles fonctionnalités',
    ],
    highlighted: false,
  },
}

// ── Client Stripe lazy ─────────────────────────────────────────────────────────

let stripeInstance: Stripe | null = null

/**
 * Retourne le client Stripe (lazy init).
 * Throw si STRIPE_SECRET_KEY n'est pas configurée (arrête le flux plutôt que de continuer sans Stripe).
 */
export function getStripe(): Stripe {
  if (stripeInstance) return stripeInstance

  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY environment variable is required')
  }

  stripeInstance = new Stripe(key)
  return stripeInstance
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Retourne le plan correspondant à un slug, ou null si slug inconnu.
 */
export function getPlanFromSlug(
  slug: string | null | undefined
): StripePlan | null {
  if (!slug) return null
  if (slug === 'starter') return PLANS.starter
  if (slug === 'growth') return PLANS.growth
  if (slug === 'pro') return PLANS.pro
  return null
}

/**
 * Retourne la limite de messages d'un plan.
 * @throws si le plan n'existe pas
 */
export function getPlanLimit(slug: StripePlanSlug): number {
  const plan = PLANS[slug]
  if (!plan) throw new Error(`Unknown plan: ${slug}`)
  return plan.messagesLimit
}

/**
 * Retourne le price_id (env var) pour un plan.
 * @throws si la variable d'environnement n'est pas configurée
 */
export function getPriceId(slug: StripePlanSlug): string {
  const envKeys: Record<StripePlanSlug, string> = {
    starter: 'STRIPE_STARTER_PRICE_ID',
    growth: 'STRIPE_GROWTH_PRICE_ID',
    pro: 'STRIPE_PRO_PRICE_ID',
  }

  const priceId = process.env[envKeys[slug]]
  if (!priceId) {
    throw new Error(`${envKeys[slug]} environment variable is required`)
  }
  return priceId
}
