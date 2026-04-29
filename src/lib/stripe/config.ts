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
export type StripePlanName = 'starter' | 'growth' | 'pro'

export interface PlanConfig {
  id: StripePlanName
  priceId: string
  unitsLimit: number
  displayName: string
}

const PLANS: Record<StripePlanName, PlanConfig> = {
  starter: { id: 'starter', priceId: process.env.STRIPE_STARTER_PRICE_ID ?? '', unitsLimit: 50, displayName: 'Starter' },
  growth: { id: 'growth', priceId: process.env.STRIPE_GROWTH_PRICE_ID ?? '', unitsLimit: 200, displayName: 'Growth' },
  pro: { id: 'pro', priceId: process.env.STRIPE_PRO_PRICE_ID ?? '', unitsLimit: 1000, displayName: 'Pro' },
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

// Reverse lookup price_id → plan slug (utilisé par le webhook)
export function getPlanByPriceId(priceId: string): StripePlanName | null {
  for (const [slug, config] of Object.entries(PLANS)) {
    if (config.priceId === priceId) return slug as StripePlanName
  }
  return null
}

// ─── Type canonique pour l'UI ───────────────────────────────────────────────
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
