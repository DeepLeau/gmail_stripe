/**
 * Stripe server-side client.
 * Initialised lazily to avoid errors during build when STRIPE_SECRET_KEY is not set.
 */

import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripeClient(): Stripe {
  if (!_stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error(
        'STRIPE_SECRET_KEY is not set. ' +
          'Please set it in your .env file or Vercel environment variables.'
      )
    }
    _stripe = new Stripe(secretKey, {
      apiVersion: '2026-03-25.dahlia',
      typescript: true,
    })
  }
  return _stripe
}
