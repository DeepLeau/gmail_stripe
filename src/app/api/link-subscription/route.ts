import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getStripe } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const stripe = getStripe()

  // Retrieve session_id from query param (passed from client)
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'missing_session_id' }, { status: 400 })
  }

  const supabase = createServerClient(
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

  // Retrieve the checkout session from Stripe
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  const customerId = typeof session.customer === 'string' ? session.customer : null

  if (!customerId) {
    return NextResponse.json({ error: 'no_customer' }, { status: 400 })
  }

  // Get authenticated user
  const accessToken = request.headers.get('cookie')?.match(/supabase-access-token=([^;]+)/)?.[1]
  if (!accessToken) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  const userClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  )

  const { data: { user }, error: authError } = await userClient.auth.getUser(accessToken)
  if (authError || !user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  // Link via RPC
  const { error: rpcError } = await supabase.rpc('link_stripe_customer', {
    p_user_id: user.id,
    p_stripe_customer_id: customerId,
    p_stripe_session_id: sessionId,
  })

  if (rpcError) {
    console.error('[LinkSubscription] RPC failed:', rpcError)
    return NextResponse.json({ error: 'link_failed' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
