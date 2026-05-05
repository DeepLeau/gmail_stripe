/**
 * src/app/actions/stripe.ts
 *
 * Server Action — crée une Stripe Checkout Session (flow GUEST).
 * Appelé par Pricing.tsx côté client.
 *
 * NE PAS MODIFIER CE FICHIER MANUELLEMENT.
 */
'use server'

import { redirect } from 'next/navigation'
import { getStripe, getPriceId, isValidPlan } from '@/lib/stripe/config'

const VALID_PLANS = ['start', 'scale', 'team'] as const

export async function createCheckoutSession(planSlug: string): Promise<void> {
  if (!isValidPlan(planSlug)) {
    throw new Error(`Invalid plan: ${planSlug}. Must be one of: ${VALID_PLANS.join(', ')}`)
  }

  const stripe = getStripe()
  const priceId = getPriceId(planSlug)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

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
    cancel_url: `${baseUrl}/pricing?checkout=cancelled`,
  })

  if (!session.url) {
    throw new Error('Failed to create Stripe checkout session URL')
  }

  redirect(session.url)
}
