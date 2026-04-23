import { NextRequest, NextResponse } from 'next/server'
import { getStripe, getPriceId, isValidPlan, StripePlanName } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let planId: string

  try {
    const body = await request.json()
    planId = body.planId
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!isValidPlan(planId)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  if (!baseUrl) {
    return NextResponse.json({ error: 'Base URL not configured' }, { status: 500 })
  }

  const priceId = getPriceId(planId as StripePlanName)
  if (!priceId) {
    return NextResponse.json({ error: 'Price ID not configured for this plan' }, { status: 500 })
  }

  const stripe = getStripe()

  // Anonymous checkout — Stripe collects customer email.
  // user_id is not known yet (no account).
  // webhook checkout.session.completed will store subscription with user_id = NULL,
  // then SignupForm calls /api/stripe/link-customer after signup to link the account.
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    // Metadata for webhook to identify the plan (metadata.user_id is NULL here — will be linked post-signup)
    metadata: {
      plan_id: planId,
    },
    // Link back to this app after payment — SignupForm reads session_id from URL params
    success_url: `${baseUrl}/signup?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/pricing`,
  })

  return NextResponse.json({ url: session.url })
}
