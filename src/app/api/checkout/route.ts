import { NextRequest, NextResponse } from 'next/server'
import { getStripe, isValidPlan, getPriceId } from '@/lib/stripe/config'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { plan } = body

    if (!plan || !isValidPlan(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be one of: start, scale, team' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll() {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stripe = getStripe()
    const priceId = getPriceId(plan)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/signup?session_id={CHECKOUT_SESSION_ID}&plan_id=${plan}`,
      cancel_url: `${baseUrl}/pricing`,
      client_reference_id: user.id,
      metadata: {
        user_id: user.id,
        plan_id: plan,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout session creation failed:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
