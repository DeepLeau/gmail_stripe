/**
 * Stripe Server Helper
 *
 * Règles Stripe skill respectées :
 * - Aucune apiVersion hardcodée → le SDK utilise sa version par défaut
 * - getStripe() avec lazy init → pas d'instance au top-level
 * - pas de throw au top-level
 */
import Stripe from 'stripe'

// ── Types ────────────────────────────────────────────────────────────────────

export type StripePlanId = 'start' | 'scale' | 'team'

export interface PlanConfig {
  id: StripePlanId
  priceId: string
  messagesLimit: number
  priceEuros: number
  name: string
}

// ── Plans ────────────────────────────────────────────────────────────────────

export const PLANS: Record<StripePlanId, PlanConfig> = {
  start: {
    id: 'start',
    priceId: process.env.STRIPE_PRICE_START ?? '',
    messagesLimit: 10,
    priceEuros: 9,
    name: 'Start',
  },
  scale: {
    id: 'scale',
    priceId: process.env.STRIPE_PRICE_SCALE ?? '',
    messagesLimit: 50,
    priceEuros: 29,
    name: 'Scale',
  },
  team: {
    id: 'team',
    priceId: process.env.STRIPE_PRICE_TEAM ?? '',
    messagesLimit: 100,
    priceEuros: 79,
    name: 'Team',
  },
}

// ── Validation ────────────────────────────────────────────────────────────────

export function isValidPlan(plan: string): plan is StripePlanId {
  return plan === 'start' || plan === 'scale' || plan === 'team'
}

export function getPlanConfig(plan: StripePlanId): PlanConfig {
  return PLANS[plan]
}

export function getPriceId(plan: StripePlanId): string {
  return PLANS[plan].priceId
}

export function getMessagesLimit(plan: StripePlanId): number {
  return PLANS[plan].messagesLimit
}

// ── Lazy Stripe instance ───────────────────────────────────────────────────────

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

// ── Checkout Session ──────────────────────────────────────────────────────────

export interface CreateCheckoutParams {
  planId: StripePlanId
  userId: string
  userEmail: string
}

export interface CreateCheckoutResult {
  checkoutUrl: string
  sessionId: string
}

export async function createCheckoutSession({
  planId,
  userId,
  userEmail,
}: CreateCheckoutParams): Promise<CreateCheckoutResult> {
  const stripe = getStripe()
  const planConfig = PLANS[planId]

  if (!planConfig.priceId) {
    throw new Error(
      `STRIPE_PRICE_${planId.toUpperCase()} environment variable is not set`
    )
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: userEmail,
    line_items: [
      {
        price: planConfig.priceId,
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/signup?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/#pricing`,
    metadata: {
      planId,
      userId,
    },
    subscription_data: {
      metadata: {
        planId,
        userId,
      },
    },
  })

  if (!session.url) {
    throw new Error('Stripe returned a session without a URL')
  }

  return {
    checkoutUrl: session.url,
    sessionId: session.id,
  }
}

// ── Retrieve session plan ────────────────────────────────────────────────────

export async function getSessionPlan(
  sessionId: string
): Promise<{ planId: StripePlanId | null; userId: string | null }> {
  const stripe = getStripe()

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    })

    const planId = (session.metadata?.planId ?? null) as StripePlanId | null
    const userId = (session.metadata?.userId ?? null) as string | null

    return { planId, userId }
  } catch {
    return { planId: null, userId: null }
  }
}

// ── Subscription helpers ─────────────────────────────────────────────────────

export interface SubscriptionInfo {
  stripeSubscriptionId: string
  stripeCustomerId: string
  planId: StripePlanId
  status: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
}

// Stripe.Subscription enrichi avec les champs de période qui existent en runtime
// mais que TypeScript ne reconnaît pas dans la version installée du SDK.
// Cast via `as unknown as` requis pour satisfaire le type checker.
type StripeSubscriptionWithPeriod = Stripe.Subscription & {
  current_period_start: number | null
  current_period_end: number | null
}

export async function retrieveSubscription(
  subscriptionId: string
): Promise<SubscriptionInfo | null> {
  const stripe = getStripe()

  try {
    const sub = (await stripe.subscriptions.retrieve(
      subscriptionId
    )) as unknown as StripeSubscriptionWithPeriod

    const rawPlanId = sub.metadata?.planId ?? 'start'
    const planId = isValidPlan(rawPlanId) ? rawPlanId : 'start'

    const periodStart =
      sub.current_period_start != null
        ? new Date(sub.current_period_start * 1000)
        : new Date()
    const periodEnd =
      sub.current_period_end != null
        ? new Date(sub.current_period_end * 1000)
        : new Date()

    return {
      stripeSubscriptionId: sub.id,
      stripeCustomerId: sub.customer as string,
      planId,
      status: sub.status,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
    }
  } catch {
    return null
  }
}
