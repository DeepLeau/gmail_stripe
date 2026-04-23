import Stripe from 'stripe'

let _stripe: Stripe | null = null

/**
 * Lazy Stripe client — reads STRIPE_SECRET_KEY only at call time.
 * Throws if the env var is absent so we fail fast instead of silently.
 * Use this in all server-side code (Server Actions, Route Handlers, Server Components).
 */
export function getStripeClient(): Stripe {
  if (_stripe) return _stripe

  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error(
      'Missing STRIPE_SECRET_KEY environment variable. ' +
        'Stripe operations require a valid secret key.'
    )
  }

  _stripe = new Stripe(secretKey, {
    // Automatically use the latest Stripe API version.
    // Pin a specific version here if you need stability guarantees.
    telemetry: false,
  })

  return _stripe
}
