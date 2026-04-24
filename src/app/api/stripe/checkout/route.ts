import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getStripe, getPriceId, isValidPlan } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

function createSupabaseServerClient(cookies: () => undefined | string): ReturnType<typeof createServerClient> {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: cookies,
        set: () => {},
        remove: () => {},
      },
    }
  )
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { plan } = body as { plan: string }

  if (!plan || !isValidPlan(plan)) {
    return NextResponse.json({ error: 'invalid plan' }, { status: 400 })
  }

  // Retrieve authenticated user from session cookie
  const supabase = createSupabaseServerClient(() => req.cookies.get('sb-access-token')?.value)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const stripe = getStripe()
  const priceId = getPriceId(plan)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/chat?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/pricing`,
    client_reference_id: user.id,
    metadata: {
      user_id: user.id,
      plan_id: plan,
    },
    subscription_data: {
      metadata: {
        user_id: user.id,
        plan_id: plan,
      },
    },
  })

  return NextResponse.json({ url: session.url })
}
