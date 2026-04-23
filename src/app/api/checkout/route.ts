import { NextRequest, NextResponse } from 'next/server'
import { getStripe, isValidPlan, getPriceId } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId } = body

    if (!planId || !isValidPlan(planId)) {
      return NextResponse.json(
        { error: 'Invalid or missing planId' },
        { status: 400 }
      )
    }

    const stripe = getStripe()
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: getPriceId(planId),
          quantity: 1,
        },
      ],
      metadata: {
        plan_id: planId,
      },
      success_url: `${baseUrl}/signup?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout session error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
