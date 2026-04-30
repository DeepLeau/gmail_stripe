import { NextRequest, NextResponse } from 'next/server'
import { getStripe, getPriceId, isValidPlan, type StripePlanName } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const { plan } = await request.json().catch(() => ({}))

  if (!plan || !isValidPlan(plan as StripePlanName)) {
    return NextResponse.json({ error: 'invalid_plan' }, { status: 400 })
  }

  const priceId = getPriceId(plan as StripePlanName)
  if (!priceId) {
    return NextResponse.json({ error: 'price_not_configured' }, { status: 500 })
  }

  const stripe = getStripe()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/chat?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/#pricing`,
    allow_promotion_codes: true,
  })

  return NextResponse.json({ url: session.url })
}
