import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/config'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let body: { sessionId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const { sessionId } = body
  if (!sessionId || typeof sessionId !== 'string') {
    return NextResponse.json({ error: 'missing_session_id' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'unauthenticated', message: 'No active user session' },
      { status: 401 }
    )
  }

  const userId = user.id

  const stripe = getStripe()
  let stripeCustomerId: string
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    stripeCustomerId = typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id ?? ''
  } catch (err) {
    console.error('[pending-link] Failed to retrieve Stripe session:', err)
    return NextResponse.json(
      { error: 'stripe_error', message: 'Failed to retrieve checkout session' },
      { status: 500 }
    )
  }

  if (!stripeCustomerId) {
    return NextResponse.json(
      { error: 'no_customer_id', message: 'No customer ID on checkout session' },
      { status: 400 }
    )
  }

  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    }
  )

  const { error: updateError } = await supabaseAdmin
    .from('pending_checkouts')
    .update({ linked_user_id: userId })
    .eq('stripe_customer_id', stripeCustomerId)
    .is('linked_user_id', null)

  if (updateError) {
    console.error('[pending-link] Failed to update pending_checkouts:', updateError)
    return NextResponse.json(
      { error: 'database_error', message: 'Failed to link session to user' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, customerId: stripeCustomerId })
}
