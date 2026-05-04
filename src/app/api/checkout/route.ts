import { NextRequest, NextResponse } from 'next/server'
import { getStripe, getPriceId, isValidPlan } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const stripe = getStripe()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

  let planId: string
  try {
    const body = await request.json()
    planId = body?.plan as string
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  if (!planId || !isValidPlan(planId)) {
    return NextResponse.json({ error: 'invalid_plan' }, { status: 400 })
  }

  const priceId = getPriceId(planId)
  if (!priceId) {
    return NextResponse.json({ error: 'price_id_not_configured' }, { status: 500 })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/chat?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/#pricing`,
    billing_address_collection: 'auto',
    customer_creation: 'always',
  })

  return NextResponse.json({ url: session.url })
}
