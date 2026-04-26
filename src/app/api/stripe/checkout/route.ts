/**
 * src/app/api/stripe/checkout/route.ts
 *
 * Crée une Checkout Session Stripe — flow GUEST (pas d'user authentifié).
 * Template: guest-subscription-quota
 *
 * NE PAS MODIFIER CE FICHIER MANUELLEMENT.
 * Régénéré par Kurtel à partir du template.
 *
 * IMPORTANT : ce flow ne fait PAS de auth.getUser(). L'user n'existe pas encore.
 * Stripe collecte l'email côté Checkout, et le webhook stocke en staging.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getStripe, getPriceId, isValidPlan } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const planParam = (body as { plan?: string })?.plan
  if (!planParam || !isValidPlan(planParam)) {
    return NextResponse.json(
      { error: 'invalid_plan', message: 'Plan must be one of: start, scale, team' },
      { status: 400 }
    )
  }

  const stripe = getStripe()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const priceId = getPriceId(planParam)

  // customer_creation: 'always' force la création d'un Stripe Customer
  // même sans email pré-fourni. Stripe collecte l'email pendant le Checkout.
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_creation: 'always',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      plan: planParam,
      flow: 'guest',
    },
    subscription_data: {
      metadata: {
        plan: planParam,
        flow: 'guest',
      },
    },
    success_url: `${baseUrl}/signup?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/pricing?checkout=cancelled`,
  })

  if (!session.url) {
    return NextResponse.json({ error: 'session_url_missing' }, { status: 500 })
  }

  return NextResponse.json({ url: session.url })
}
