import Stripe from 'stripe'

export type PlanId = 'start' | 'scale' | 'team'

const PLAN_PRICE_IDS: Record<PlanId, string | undefined> = {
  start: process.env.STRIPE_PRICE_ID_START,
  scale: process.env.STRIPE_PRICE_ID_SCALE,
  team: process.env.STRIPE_PRICE_ID_TEAM,
}

const PLAN_QUOTAS: Record<PlanId, number> = {
  start: 10,
  scale: 50,
  team: 100,
}

function getPlanQuota(planId: PlanId): number {
  return PLAN_QUOTAS[planId] ?? 10
}

let _stripe: Stripe | null = null

function getStripe(): Stripe {
  if (!_stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('Missing STRIPE_SECRET_KEY environment variable')
    }
    _stripe = new Stripe(secretKey)
  }
  return _stripe
}

export function createCheckoutSession(planId: PlanId): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe()
  const priceId = PLAN_PRICE_IDS[planId]

  if (!priceId) {
    throw new Error(`No price ID configured for plan: ${planId}`)
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  return stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/signup?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/#pricing`,
    metadata: {
      planId,
    },
  })
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error('Missing STRIPE_WEBHOOK_SECRET environment variable')
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}

export function getPlanQuotaFromId(planId: PlanId): number {
  return getPlanQuota(planId)
}
