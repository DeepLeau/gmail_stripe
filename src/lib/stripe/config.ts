/**
 * Configuration Stripe server-side
 * Exporte le client Stripe et les définitions des 3 plans avec leurs limites de messages.
 *
 * STRIPE_SECRET_KEY doit être présent côté serveur. L'absence throw au premier appel —
 * pas de création silencieuse d'un client null (contrairement à Supabase client).
 */
import Stripe from 'stripe'

// ─────────────────────────────────────────────────────────────────────────────
// Plans — name, limites de messages, price IDs Stripe
// ─────────────────────────────────────────────────────────────────────────────

/** Plans supportés */
export const VALID_PLANS = ['start', 'scale', 'team'] as const
export type StripePlanName = (typeof VALID_PLANS)[number]

/** Alias pour compatibilité des imports */
export type PlanName = StripePlanName

/** Limites mensuelles de messages par plan */
export const MESSAGES_LIMIT: Record<StripePlanName, number> = {
  start: 50,
  scale: 200,
  team: 1000,
}

/** Prix Stripe (Price IDs) par plan */
export const STRIPE_PRICE_IDS: Record<StripePlanName, string | undefined> = {
  start: process.env.STRIPE_START_PRICE_ID,
  scale: process.env.STRIPE_SCALE_PRICE_ID,
  team: process.env.STRIPE_TEAM_PRICE_ID,
}

// ─────────────────────────────────────────────────────────────────────────────
// Client Stripe
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Crée le client Stripe de façon paresseuse.
 * Throw si STRIPE_SECRET_KEY est absent (comportement fail-fast côté serveur).
 */
function createStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error(
      '[stripe] STRIPE_SECRET_KEY est absent. ' +
        'Ajoute STRIPE_SECRET_KEY dans ton fichier .env.local.'
    )
  }

  // Use the latest stable API version compatible with the installed Stripe SDK.
  // If the SDK is out of date, this will fall back to the SDK default.
  return new Stripe(secretKey)
}

// Lazy singleton — ne s'instancie qu'au premier appel, pas au module load
let _stripe: Stripe | undefined

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = createStripeClient()
  }
  return _stripe
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de lookup
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Valide qu'un nom de plan est parmi les plans supportés.
 */
export function isValidPlan(plan: string): plan is StripePlanName {
  return VALID_PLANS.includes(plan as StripePlanName)
}

/**
 * Retourne le price_id Stripe correspondant au plan.
 * Throw si le price_id n'est pas configuré.
 */
export function getPriceIdForPlan(plan: StripePlanName): string {
  const priceId = STRIPE_PRICE_IDS[plan]
  if (!priceId) {
    throw new Error(
      `[stripe] Le price_id pour le plan "${plan}" n'est pas configuré. ` +
        `Définis STRIPE_${plan.toUpperCase()}_PRICE_ID dans ton .env.local.`
    )
  }
  return priceId
}

/** Alias pour compatibilité des imports */
export { getPriceIdForPlan as getPriceId }

/**
 * Retourne la limite de messages pour un plan.
 * Throw si le plan est inconnu.
 */
export function getMessagesLimit(plan: StripePlanName): number {
  const limit = MESSAGES_LIMIT[plan]
  if (limit === undefined) {
    throw new Error(`[stripe] Plan inconnu : "${plan}"`)
  }
  return limit
}

/** Alias pour compatibilité des imports */
export { getMessagesLimit as getPlanLimit }

// ─────────────────────────────────────────────────────────────────────────────
// Vérification de signature webhook
// ─────────────────────────────────────────────────────────────────────────────

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET

/**
 * Vérifie la signature d'un événement Stripe.
 *
 * @param rawBody   - Corps brut de la requête (string ou Buffer)
 * @param signature - Valeur du header `stripe-signature`
 * @returns L'événement Stripe typé, ou throw si signature invalide
 */
export async function constructWebhookEvent(
  rawBody: string | Buffer,
  signature: string
): Promise<Stripe.Event> {
  if (!WEBHOOK_SECRET) {
    throw new Error(
      '[stripe] STRIPE_WEBHOOK_SECRET est absent. ' +
        'Ajoute STRIPE_WEBHOOK_SECRET dans ton fichier .env.local.'
    )
  }

  const stripe = getStripe()
  return stripe.webhooks.constructEventAsync(rawBody, signature, WEBHOOK_SECRET)
}
