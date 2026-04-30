import { NextRequest, NextResponse } from 'next/server'
import { getStripe, isValidPlanSlug, getPriceId, BASE_URL } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

const VALID_SLUGS = ['starter', 'growth', 'pro'] as const

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { plan } = body as { plan?: string }

  if (!plan || typeof plan !== 'string') {
    return NextResponse.json({ error: 'Missing plan field' }, { status: 400 })
  }

  if (!isValidPlanSlug(plan)) {
    return NextResponse.json(
      { error: `Invalid plan slug. Must be one of: ${VALID_SLUGS.join(', ')}` },
      { status: 400 }
    )
  }

  let stripe
  try {
    stripe = getStripe()
  } catch {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 })
  }

  let priceId: string
  try {
    priceId = getPriceId(plan)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Price ID not configured' },
      { status: 500 }
    )
  }

  try {
    const successUrl = `${BASE_URL}/signup?session_id={CHECKOUT_SESSION_ID}&plan_id=${plan}`
    const cancelUrl = `${BASE_URL}/#pricing`

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
        plan_id: plan,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[/api/checkout] Stripe error:', err)
    const message = err instanceof Error ? err.message : 'Stripe error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
