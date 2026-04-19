/**
 * Stripe server-side client.
 * SERVER ONLY — never import this from client components.
 * Lazy initialization to avoid errors during build when env vars are not yet available.
 */
import Stripe from 'stripe'

let _client: Stripe | null = null

function getStripeClient(): Stripe {
  if (_client) return _client

  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error(
      'Missing STRIPE_SECRET_KEY environment variable. ' +
        'This variable must be set on the server side.'
    )
  }

  // No apiVersion — let the SDK use its default version
  _client = new Stripe(secretKey)

  return _client
}

export { getStripeClient }
