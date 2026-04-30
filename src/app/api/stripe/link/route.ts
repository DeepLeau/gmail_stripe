import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe/config'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const { session_id, email } = await request.json().catch(() => ({}))

  if (!session_id || !email) {
    return NextResponse.json({ error: 'missing_params' }, { status: 400 })
  }

  const stripe = getStripe()

  let stripeCustomerId: string | null = null
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id)
    stripeCustomerId = typeof session.customer === 'string' ? session.customer : null
  } catch {
    return NextResponse.json({ error: 'invalid_session' }, { status: 400 })
  }

  if (!stripeCustomerId) {
    return NextResponse.json({ error: 'no_customer' }, { status: 400 })
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

  // Retrieve user by email
  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle()

  if (!userData?.id) {
    return NextResponse.json({ error: 'user_not_found' }, { status: 404 })
  }

  // Upsert pending checkout to link stripe customer to user
  const { error: upsertError } = await supabase
    .from('pending_checkouts')
    .upsert(
      { stripe_customer_id: stripeCustomerId, linked_user_id: userData.id },
      { onConflict: 'stripe_customer_id' }
    )

  if (upsertError) {
    console.error('[Stripe link] failed to upsert pending_checkouts:', upsertError)
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
