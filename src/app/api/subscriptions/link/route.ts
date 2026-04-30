import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const { session_id } = await request.json()

  if (!session_id) {
    return NextResponse.json({ error: 'session_id required' }, { status: 400 })
  }

  // Get authenticated user
  const supabaseUser = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: () => request.cookies.get('sb-access-token')?.value,
        set: () => {},
        remove: () => {},
      },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  )

  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // Retrieve the Stripe checkout session to get customer_id
  const { getStripe } = await import('@/lib/stripe/config')
  const stripe = getStripe()
  let customerId: string | null = null
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id)
    customerId = typeof session.customer === 'string' ? session.customer : null
  } catch {
    return NextResponse.json({ error: 'invalid session' }, { status: 400 })
  }

  if (!customerId) {
    return NextResponse.json({ error: 'no customer on session' }, { status: 400 })
  }

  // Link via RPC (service role needed to update pending_checkouts + user_subscriptions)
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  ) as any

  const { error } = await supabaseAdmin.rpc('apply_pending_checkout', {
    p_stripe_session_id: session_id,
    p_user_id: user.id,
    p_stripe_customer_id: customerId,
  })

  if (error) {
    console.error('[subscriptions/link] apply_pending_checkout failed:', error)
    return NextResponse.json({ error: 'linking failed' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
