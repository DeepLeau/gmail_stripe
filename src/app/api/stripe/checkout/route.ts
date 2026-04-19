import { NextRequest, NextResponse } from 'next/server'
import { getStripe, isValidPlan, type StripePlanName } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId } = body as { planId: string }

    if (!planId || !isValidPlan(planId)) {
      return NextResponse.json({ error: 'invalid_plan' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
    const stripe = getStripe()

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: planId as string,
          quantity: 1,
        },
      ],
      metadata: {
        planId,
      },
      success_url: `${baseUrl}/signup?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#pricing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[Stripe] checkout error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'stripe_error', message }, { status: 500 })
  }
}
