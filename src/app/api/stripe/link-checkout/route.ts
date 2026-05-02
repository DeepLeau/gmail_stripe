import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { session_id, user_id, customer_email } = body as {
    session_id: string
    user_id: string
    customer_email?: string
  }

  if (!session_id || !user_id) {
    return NextResponse.json({ error: 'session_id and user_id are required' }, { status: 400 })
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
  )

  // Retrieve the Checkout Session to verify email match
  const { getStripe } = await import('@/lib/stripe/config')
  const stripe = getStripe()
  const session = await stripe.checkout.sessions.retrieve(session_id)

  // Check email match if customer_email provided
  if (customer_email) {
    const sessionEmail =
      session.customer_details?.email ?? session.customer_email ?? null
    if (sessionEmail && sessionEmail.toLowerCase() !== customer_email.toLowerCase()) {
      return NextResponse.json({ error: 'email_mismatch' }, { status: 409 })
    }
  }

  // Link via pending_checkouts if the webhook already processed this session
  const { data: pending } = await supabase
    .from('pending_checkouts')
    .select('stripe_session_id')
    .eq('stripe_session_id', session_id)
    .is('linked_user_id', null)
    .maybeSingle()

  if (pending) {
    const { error: updateError } = await supabase
      .from('pending_checkouts')
      .update({ linked_user_id: user_id })
      .eq('stripe_session_id', session_id)
      .is('linked_user_id', null)

    if (updateError) {
      console.error('[link-checkout] Failed to update pending_checkouts:', updateError)
      return NextResponse.json({ error: 'database_error' }, { status: 500 })
    }
  }

  // Also update user_subscriptions if it was already created by the webhook
  const customerId = typeof session.customer === 'string' ? session.customer : null
  if (customerId) {
    await supabase
      .from('user_subscriptions')
      .update({ user_id })
      .eq('stripe_customer_id', customerId)
      .is('user_id', null)
  }

  return NextResponse.json({ success: true })
}
