/**
 * Stripe client for browser-side usage.
 * Loads Stripe.js lazily to avoid SSR issues.
 */
import { loadStripe, type Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null> | null = null

export function getStripe(): Promise<Stripe | null> {
  if (stripePromise) return stripePromise

  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  if (!publishableKey) {
    console.error('[Stripe] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set')
    stripePromise = Promise.resolve(null)
    return stripePromise
  }

  stripePromise = loadStripe(publishableKey)
  return stripePromise
}
