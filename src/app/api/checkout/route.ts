import { NextRequest, NextResponse } from 'next/server'
import { getStripe, isValidPlan, getPriceId, type StripePlanName } from '@/lib/stripe/config'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const planId = body.plan as StripePlanName | undefined

    if (!planId || !isValidPlan(planId)) {
      return NextResponse.json({ error: 'invalid_plan' }, { status: 400 })
    }

    // Get authenticated user from Supabase
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => [],
          setAll: () => {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    const stripe = getStripe()
    const priceId = getPriceId(planId)

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/#pricing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#pricing`,
      customer_email: user?.email ?? undefined,
      metadata: {
        plan_id: planId,
        user_id: user?.id ?? '',
      },
      client_reference_id: user?.id ?? undefined,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[Checkout] Error:', err)
    return NextResponse.json({ error: 'checkout_creation_failed' }, { status: 500 })
  }
}
