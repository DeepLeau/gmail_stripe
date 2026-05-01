import { NextRequest, NextResponse } from 'next/server'
import { getStripe, getPriceId, isValidPlan, type StripePlanName } from '@/lib/stripe/config'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const planId = body?.plan as string | undefined

  if (!planId || !isValidPlan(planId)) {
    return NextResponse.json({ error: 'plan_id_required' }, { status: 400 })
  }

  // Retrieve l'utilisateur connecté via le cookie de session Supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: () => request.cookies.get('sb-session')?.value,
        set: () => {},
        remove: () => {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  const priceId = getPriceId(planId as StripePlanName)
  if (!priceId) {
    return NextResponse.json({ error: 'price_id_not_configured' }, { status: 500 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

  const stripe = getStripe()
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: user.email ?? undefined,
    client_reference_id: user.id,
    metadata: {
      user_id: user.id,
      plan_id: planId,
    },
    success_url: `${baseUrl}/chat?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/pricing`,
  })

  return NextResponse.json({ url: session.url })
}
