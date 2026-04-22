import { NextRequest, NextResponse } from 'next/server'
import { getStripe, isValidPlan, getPriceId, type StripePlanName } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

interface CheckoutBody {
  planId: StripePlanName
}

export async function POST(req: NextRequest) {
  try {
    const body: CheckoutBody = await req.json()
    const { planId } = body

    if (!planId || !isValidPlan(planId)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be one of: start, scale, team' },
        { status: 400 }
      )
    }

    const priceId = getPriceId(planId)

    if (!priceId) {
      console.error('[Checkout] Missing price ID for plan:', planId)
      return NextResponse.json(
        { error: `Price ID not configured for plan: ${planId}. Check STRIPE_START_PRICE_ID, STRIPE_SCALE_PRICE_ID, or STRIPE_TEAM_PRICE_ID env vars.` },
        { status: 500 }
      )
    }

    const stripe = getStripe()
    const origin = req.headers.get('origin') ?? 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        plan_id: planId,
      },
    })

    if (!session.url || !session.id) {
      throw new Error('Stripe session creation returned no URL')
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('[Checkout] Error creating session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session. Please try again.' },
      { status: 500 }
    )
  }
}
