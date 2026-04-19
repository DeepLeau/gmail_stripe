'use server'

import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe/config'

export async function createCheckoutSession(
  planId: 'start' | 'scale' | 'team'
): Promise<
  | { url: string }
  | { redirectTo: string }
  | { error: string }
> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { redirectTo: '/login?redirectTo=/' }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

  try {
    const stripe = getStripe()

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Emind ${planId.charAt(0).toUpperCase() + planId.slice(1)}`,
              description: `Plan ${planId} — messages email IA`,
            },
            unit_amount:
              planId === 'start'
                ? 0
                : planId === 'scale'
                ? 1900
                : 4900,
          },
          quantity: 1,
        },
      ],
      customer_email: user.email ?? undefined,
      client_reference_id: user.id,
      metadata: {
        planId,
        userId: user.id,
      },
      subscription_data: {
        metadata: {
          planId,
          userId: user.id,
        },
      },
      success_url: `${baseUrl}/chat?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/`,
    })

    if (!session.url) {
      return { error: 'Impossible de créer la session de paiement.' }
    }

    return { url: session.url }
  } catch (err) {
    console.error('[checkout] Stripe error:', err)
    return { error: 'Une erreur est survenue lors de la création du paiement.' }
  }
}
