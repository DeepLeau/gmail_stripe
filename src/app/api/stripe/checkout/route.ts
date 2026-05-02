import { NextRequest, NextResponse } from 'next/server'
import { getStripe, isValidPlan, getPriceId, type StripePlanName } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

const VALID_PLANS: StripePlanName[] = ['starter', 'growth', 'pro']

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe non configuré' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 })
  }

  const { plan } = body as { plan?: string }

  if (!plan || !isValidPlan(plan) || !VALID_PLANS.includes(plan)) {
    return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
  }

  const priceId = getPriceId(plan)
  if (!priceId) {
    return NextResponse.json({ error: 'Price ID non configuré pour ce plan' }, { status: 500 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const successUrl = `${baseUrl}/signup?session_id={CHECKOUT_SESSION_ID}`
  const cancelUrl = `${baseUrl}/#pricing`

  try {
    const stripe = getStripe()

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        plan_slug: plan,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur Stripe inconnue'
    console.error('[Stripe checkout] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
