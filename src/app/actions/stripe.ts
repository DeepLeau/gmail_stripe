/**
 * src/app/actions/stripe.ts
 *
 * Server Action — crée une Stripe Checkout Session (flow GUEST).
 * Exporte createCheckoutSessionAction(plan) qui appelle POST /api/stripe/checkout
 * et retourne { url } pour redirection côté client.
 */
'use server'

import { isValidPlan } from '@/lib/stripe/config'

export async function createCheckoutSessionAction(plan: string): Promise<{ url?: string; error?: string }> {
  if (!isValidPlan(plan)) {
    return { error: 'invalid_plan' }
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/stripe/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return { error: data.message || 'checkout_failed' }
    }

    const data = await res.json()
    return { url: data.url }
  } catch (err) {
    console.error('[createCheckoutSessionAction]', err)
    return { error: 'network_error' }
  }
}
