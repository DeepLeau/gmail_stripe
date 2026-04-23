import { NextResponse } from 'next/server'
import { getStripe, getPriceId, isValidPlan, type StripePlanName } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { planId } = body

    if (!planId || typeof planId !== 'string') {
      return NextResponse.json(
        { error: 'planId is required' },
        { status: 400 }
      )
    }

    if (!isValidPlan(planId)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be one of: start, scale, team' },
        { status: 400 }
      )
    }

    const stripe = getStripe()
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
    const priceId = getPriceId(planId as StripePlanName)

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID not configured for this plan' },
        { status: 500 }
      )
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
        },
      ],
      client_reference_id: planId,
      metadata: {
        plan_id: planId,
      },
      subscription_data: {
        metadata: {
          plan_id: planId,
        },
      },
      success_url: `${baseUrl}/signup?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
    })

    if (!session.url) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
