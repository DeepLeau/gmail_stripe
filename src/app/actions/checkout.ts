/**
 * src/app/actions/checkout.ts
 *
 * Server Action — crée une Stripe Checkout Session pour le plan choisi.
 * Flow GUEST : l'utilisateur paie AVANT de créer son compte.
 *
 * Appelée depuis Pricing.tsx côté client (createCheckoutSession).
 * L'URL Stripe redirige vers /signup?session_id={CHECKOUT_SESSION_ID}.
 */
'use server'

import { getStripe, getPriceId, isValidPlan, type StripePlanName } from '@/lib/stripe/config'

export interface CheckoutResult {
  url?: string
  error?: string
}

export async function createCheckoutSession(plan: string): Promise<CheckoutResult> {
  if (!isValidPlan(plan)) {
    return { error: 'Plan invalide. Veuillez sélectionner un autre plan.' }
  }

  try {
    const stripe = getStripe()
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const priceId = getPriceId(plan as StripePlanName)

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        plan,
        flow: 'guest',
      },
      subscription_data: {
        metadata: {
          plan,
          flow: 'guest',
        },
      },
      success_url: `${baseUrl}/signup?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#pricing?checkout=cancelled`,
    })

    if (!session.url) {
      return { error: 'Impossible de créer la session de paiement.' }
    }

    return { url: session.url }
  } catch (err) {
    console.error('[createCheckoutSession] Stripe error:', err)
    return {
      error:
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue lors de la création de la session.',
    }
  }
}
