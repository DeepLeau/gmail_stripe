/**
 * Stripe Server Client — lazy-initialized.
 * Ne JAMAIS importer ce module depuis un Client Component.
 *
 * L'instance est créée au premier appel runtime, jamais au build/import time.
 * throwIfNotReady() est appelé implicitement par getStripe() avant chaque usage.
 */
import Stripe from 'stripe'

let _stripe: Stripe | null = null

function throwIfNotReady(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error(
      'Missing STRIPE_SECRET_KEY environment variable. ' +
        'Please set it in your .env file.'
    )
  }
  return new Stripe(key, {
    apiVersion: '2026-03-25.dahlia',
    typescript: true,
  })
}

/**
 * Get or create the Stripe singleton instance.
 * Initialisé lazy — le throw ne se produit qu'au premier appel runtime.
 */
export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = throwIfNotReady()
  }
  return _stripe
}
