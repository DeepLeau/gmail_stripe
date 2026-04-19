/**
 * Stripe Server Client
 * Lazy-initialized on first call to avoid build-time crashes when env vars are missing.
 * Only used in Server Components, Route Handlers, and Server Actions.
 */

// Plan → Stripe Price ID mapping
const PLAN_PRICE_IDS: Record<string, string | undefined> = {
  start: process.env.STRIPE_START_PRICE_ID,
  scale: process.env.STRIPE_SCALE_PRICE_ID,
  team: process.env.STRIPE_TEAM_PRICE_ID,
}

// Plan → messages limit
const PLAN_MESSAGES_LIMITS: Record<string, number> = {
  start: 50,
  scale: 200,
  team: 1000,
}

let _stripeClient: import('stripe').default | null = null

export function createClient(): import('stripe').default {
  if (_stripeClient) return _stripeClient

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error(
      'Missing STRIPE_SECRET_KEY environment variable. ' +
        'Please set it in your .env file.'
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Stripe = require('stripe')

  _stripeClient = new Stripe(secretKey, {
    apiVersion: '2026-03-25.dahlia',
    telemetry: false,
  })

  return _stripeClient!
}
