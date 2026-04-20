import { NextRequest, NextResponse } from 'next/server'
import { getStripe, isValidPlan, getPlanConfig, type StripePlanId } from '@/lib/stripe/config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, plan } = body as { email: string; plan: string }

    // Validation du plan
    if (!isValidPlan(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const stripe = getStripe()
    const planConfig = getPlanConfig(plan as StripePlanId)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    // Créer la session de checkout Stripe
    // Flow B (anonyme) : on stocke email + plan dans metadata
    // Le user_id sera lié après le signup via le callback Stripe
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Emind — Plan ${planConfig.name}`,
              description: `${planConfig.messagesLimit} messages/mois avec Emind`,
            },
            unit_amount: planConfig.price * 100, // euros → cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        plan: plan,
        email: email,
        // Pas de pending_user_id car le compte n'est pas encore créé (Flow B)
      },
      success_url: `${appUrl}/auth/stripe/callback?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/signup/${plan}?canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
