import { NextRequest, NextResponse } from 'next/server'
import { getStripe, getPriceId, isValidPlan, type StripePlanName } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const stripe = getStripe()

  let planId: StripePlanName = 'scale' // default
  try {
    const body = await request.json()
    if (body?.planId && isValidPlan(body.planId)) {
      planId = body.planId
    }
  } catch {
    // use default
  }

  const priceId = getPriceId(planId)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/chat?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#pricing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[Checkout] Failed to create session:', err)
    return NextResponse.json({ error: 'checkout_failed' }, { status: 500 })
  }
}
