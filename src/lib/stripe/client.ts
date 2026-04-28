/**
 * src/lib/stripe/client.ts
 *
 * Stripe.js côté browser — utilisé pour rediriger vers Checkout après création de session.
 * Lazy load via @stripe/stripe-js pour éviter d'embarquer Stripe.js dans tous les bundles.
 */
import { loadStripe, type Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null> | null = null

export function getStripeBrowser(): Promise<Stripe | null> {
  if (stripePromise) return stripePromise

  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  if (!publishableKey) {
    console.error('[Stripe] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set')
    return Promise.resolve(null)
  }

  stripePromise = loadStripe(publishableKey)
  return stripePromise
}
