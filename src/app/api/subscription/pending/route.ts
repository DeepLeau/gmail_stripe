import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { getStripe } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
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

  // Authentification via session cookie
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { stripeSessionId } = body
  if (!stripeSessionId || typeof stripeSessionId !== 'string') {
    return NextResponse.json({ error: 'invalid_session_id' }, { status: 400 })
  }

  const stripe = getStripe()

  // Retrieve la session Stripe pour vérifier son existence
  try {
    await stripe.checkout.sessions.retrieve(stripeSessionId)
  } catch (err) {
    console.error('[subscription/pending] Failed to retrieve Stripe session:', err)
    return NextResponse.json({ error: 'stripe_session_not_found' }, { status: 404 })
  }

  // Link la session au user existant via RPC (paramètres validés : p_session_id uniquement)
  const { error: rpcError } = await supabase.rpc('link_stripe_session_to_user', {
    p_session_id: stripeSessionId,
  })

  if (rpcError) {
    console.error('[subscription/pending] link_stripe_session_to_user failed:', rpcError)
    return NextResponse.json({ error: 'db_link_failed' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
