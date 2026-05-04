/**
 * src/lib/stripe/config.ts
 *
 * Configuration Stripe — lazy init du client + déclaration des plans.
 * Suit toutes les règles de skill stripe.md (§1, §2, §3, §8, §9).
 *
 * NE PAS MODIFIER CE FICHIER MANUELLEMENT.
 * Régénéré par Kurtel à partir de templates/stripe/_shared/lib/stripe/config.ts.template
 *
 * Pour ajouter/modifier un plan, mettre à jour le brief PM ou le meta.json du template.
 */
import Stripe from 'stripe'

// ─── Type des plans ─────────────────────────────────────────────────────────
export type StripePlanName = 'start' | 'scale' | 'team'

// PlanSlug = alias pour compatibilité avec les consommateurs existants
export type PlanSlug = StripePlanName

export interface PlanConfig {
  id: StripePlanName
  priceId: string
  unitsLimit: number
  displayName: string
}

const PLANS: Record<StripePlanName, PlanConfig> = {
  start: { id: 'start', priceId: process.env.STRIPE_START_PRICE_ID ?? '', unitsLimit: 10, displayName: 'Start' },
  scale: { id: 'scale', priceId: process.env.STRIPE_SCALE_PRICE_ID ?? '', unitsLimit: 50, displayName: 'Scale' },
  team: { id: 'team', priceId: process.env.STRIPE_TEAM_PRICE_ID ?? '', unitsLimit: 100, displayName: 'Team' },
}

// Re-export du record pour les consommateurs qui veulent itérer sur tous les plans
// (ex: Pricing.tsx pour rendre les cartes). Évite d'avoir à exposer PLANS lui-même.
export const STRIPE_PLANS: Record<StripePlanName, PlanConfig> = PLANS

// ─── Client Stripe lazy (skill stripe.md §2.2) ──────────────────────────────
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

// ─── Helpers (noms canoniques, skill stripe.md §3.2) ────────────────────────
export function isValidPlan(plan: string): plan is StripePlanName {
  return plan in PLANS
}

export function getPriceId(plan: StripePlanName): string {
  return PLANS[plan].priceId
}

export function getPlanLimit(plan: StripePlanName): number {
  return PLANS[plan].unitsLimit
}

export function getPlanDisplayName(plan: StripePlanName): string {
  return PLANS[plan].displayName
}

export function getAllPlans(): PlanConfig[] {
  return Object.values(PLANS)
}

// Lookup direct par id — utile pour les consommateurs qui ont déjà un StripePlanName
// validé et veulent l'objet complet (ex: webhook après getPlanByPriceId).
export function getPlanById(id: StripePlanName): PlanConfig {
  return PLANS[id]
}

// Alias canonical pour les consommateurs qui attendent `getPlan`
export { getPlanById as getPlan }

// Reverse lookup price_id → plan slug (utilisé par le webhook)
export function getPlanByPriceId(priceId: string): StripePlanName | null {
  for (const [slug, config] of Object.entries(PLANS)) {
    if (config.priceId === priceId) return slug as StripePlanName
  }
  return null
}

// ─── PLAN_LIST — structure attendue par Pricing.tsx et autres consommateurs ──
// price_cents provient des env vars STRIPE_*_PRICE_CENTS (stockées en centimes pour éviter les floats)
// price_label est dérivé de price_cents au runtime
const START_PRICE_CENTS = parseInt(process.env.STRIPE_START_PRICE_CENTS ?? '0', 10)
const SCALE_PRICE_CENTS = parseInt(process.env.STRIPE_SCALE_PRICE_CENTS ?? '0', 10)
const TEAM_PRICE_CENTS = parseInt(process.env.STRIPE_TEAM_PRICE_CENTS ?? '0', 10)

function centsToLabel(cents: number): string {
  if (cents === 0) return '0 €'
  return `${(cents / 100).toFixed(0)} €`
}

export const PLAN_LIST = {
  start: {
    id: 'start' as const,
    display_name: PLANS.start.displayName,
    limit: PLANS.start.unitsLimit,
    price_cents: START_PRICE_CENTS,
    price_label: centsToLabel(START_PRICE_CENTS),
  },
  scale: {
    id: 'scale' as const,
    display_name: PLANS.scale.displayName,
    limit: PLANS.scale.unitsLimit,
    price_cents: SCALE_PRICE_CENTS,
    price_label: centsToLabel(SCALE_PRICE_CENTS),
  },
  team: {
    id: 'team' as const,
    display_name: PLANS.team.displayName,
    limit: PLANS.team.unitsLimit,
    price_cents: TEAM_PRICE_CENTS,
    price_label: centsToLabel(TEAM_PRICE_CENTS),
  },
} as const satisfies Record<StripePlanName, {
  id: string
  display_name: string
  limit: number
  price_cents: number
  price_label: string
}>

// ─── Type canonique pour l'UI ───────────────────────────────────────────────
//
// Round 10 — ce type est exporté par le template pour que les consommateurs
// (chat/page.tsx, ChatInterface, UserMenu...) ne l'inventent JAMAIS avec des
// noms hallucinés. Cf. Run #26 : le compileAndFix avait fabriqué un type
// fantôme avec des noms incohérents avec la DB qui stocke en units_*.
//
// Tous les fichiers consommateurs DOIVENT importer ce type :
//   import type { SubscriptionData } from '@/lib/stripe/config'
//
// Shape :
// - plan : slug du plan actif ('start', 'scale', ...) ou null si pas d'abo
// - units_used : compteur consommé sur la période courante
// - units_limit : limite du plan ; null si pas d'abo (= illimité côté UI = 'Free')
// - units_remaining : units_limit - units_used, clampé à 0 ; null si pas de limite
// - status : 'free' | 'active' | 'past_due' | 'canceled' | 'incomplete' | etc.
//   (correspond au subscription_status de la table user_subscriptions, plus 'free'
//    pour les users sans ligne ou avec subscription_status = 'free')
export interface SubscriptionData {
  plan: string | null
  units_used: number
  units_limit: number | null
  units_remaining: number | null
  status: string
}

// ─── Unit label (messages, minutes, crédits...) ─────────────────────────────
export const UNIT_LABEL = 'message'
export const UNIT_LABEL_PLURAL = 'messages'
