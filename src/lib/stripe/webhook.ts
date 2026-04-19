// ============================================================
// Stripe webhook — signature verification
// Called by the webhook route handler, never by client code
// ============================================================
import Stripe from 'stripe'
import { getStripe } from './config'

export interface WebhookVerificationResult {
  event: Stripe.Event
  success: true
}

/**
 * Vérifie la signature Stripe et parse l'event.
 * Retourne le résultat ou throw en cas d'erreur — le handler
 * rattrape et retourne 400.
 */
export async function verifyAndConstructEvent(
  rawBody: string,
  signatureHeader: string | null
): Promise<WebhookVerificationResult> {
  if (!signatureHeader) {
    throw new Error('Missing stripe-signature header')
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set')
  }

  const stripe = getStripe()

  const event = stripe.webhooks.constructEvent(rawBody, signatureHeader, webhookSecret)

  return { event, success: true }
}
