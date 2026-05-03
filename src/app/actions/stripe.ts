/**
 * src/app/actions/stripe.ts
 *
 * Server Action — crée une Stripe Checkout Session et retourne l'URL.
 * Utilisé par Pricing.tsx pour initier le flow guest checkout.
 *
 * Flow guest (pas d'user connecté) :
 *   Landing → Pricing → initiateCheckout(plan) → redirect Stripe →
 *   → /signup?session_id={CHECKOUT_SESSION_ID} → SignupForm lie le compte
 */
'use server'

import { redirect } from 'next/navigation'
import { getStripe, isValidPlan, type StripePlanName } from '@/lib/stripe/config'

export interface InitiateCheckoutResult {
  url?: string
  error?: string
}

/**
 * Crée une Stripe Checkout Session pour le plan donné.
 * Retourne l'URL de redirection Stripe ou une erreur.
 *
 * @param planSlug - 'starter' | 'growth' | 'pro'
 */
export async function initiateCheckout(planSlug: string): Promise<InitiateCheckoutResult> {
  if (!isValidPlan(planSlug)) {
    return { error: 'Plan invalide. Veuillez sélectionner un plan parmi : starter, growth, pro.' }
  }

  const stripe = getStripe()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  const { getPriceId } = await import('@/lib/stripe/config')
  const priceId = getPriceId(planSlug as StripePlanName)

  if (!priceId) {
    return { error: 'Prix non configuré pour ce plan. Veuillez contacter le support.' }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        plan: planSlug,
        flow: 'guest',
      },
      subscription_data: {
        metadata: {
          plan: planSlug,
          flow: 'guest',
        },
      },
      success_url: `${baseUrl}/signup?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#pricing`,
    })

    if (!session.url) {
      return { error: 'Impossible de créer la session de paiement. Veuillez réessayer.' }
    }

    return { url: session.url }
  } catch (err) {
    console.error('[initiateCheckout] Stripe error:', err)
    return {
      error: err instanceof Error
        ? err.message
        : 'Une erreur est survenue lors de la création du checkout.'
    }
  }
}
