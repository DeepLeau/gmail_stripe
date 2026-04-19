import { NextRequest, NextResponse } from 'next/server'
import { getStripe, isValidPlan, getPriceId, getPlanLimit, type StripePlanName } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { plan } = body as { plan: string }

    if (!plan || !isValidPlan(plan)) {
      return NextResponse.json(
        { error: 'Plan invalide. Utilisez start, scale ou team.' },
        { status: 400 }
      )
    }

    const priceId = getPriceId(plan as StripePlanName)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const stripe = getStripe()

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/signup?session_id={CHECKOUT_SESSION_ID}&plan_id=${plan}`,
      cancel_url: `${baseUrl}/#pricing`,
      metadata: {
        plan,
        messages_limit: String(getPlanLimit(plan as StripePlanName)),
      },
      subscription_data: {
        metadata: {
          plan,
          messages_limit: String(getPlanLimit(plan as StripePlanName)),
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[Stripe] Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement.' },
      { status: 500 }
    )
  }
}
