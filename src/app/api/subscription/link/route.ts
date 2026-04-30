import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/config'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

/**
 * POST /api/subscription/link
 *
 * Lie un Stripe Checkout Session à un user freshly créé.
 * Appelée par SignupForm après un signUp réussi quand un pendingCheckoutToken
 * (session_id) est présent dans l'URL.
 *
 * Workflow :
 * 1. Retrieve la Checkout Session côté Stripe (vérifie qu'elle existe)
 * 2. Lookup le pending_checkout par stripe_session_id (pas encore linked)
 * 3. UPDATE linked_user_id + customer_id sur le pending_checkout
 *
 * Le webhook customer.subscription.created/customer.subscription.updated
 * verra le pending_checkout avec un linked_user_id et pourra faire le lien
 * vers user_subscriptions via stripe_customer_id.
 */
export async function POST(request: NextRequest) {
  let body: { session_id: string; user_id: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const { session_id, user_id } = body
  if (!session_id || typeof session_id !== 'string') {
    return NextResponse.json({ error: 'missing_session_id' }, { status: 400 })
  }
  if (!user_id || typeof user_id !== 'string') {
    return NextResponse.json({ error: 'missing_user_id' }, { status: 400 })
  }

  // Retrieve la session Stripe pour avoir le customer_id
  const stripe = getStripe()
  let stripeSession: import('stripe').Stripe.Checkout.Session
  try {
    stripeSession = await stripe.checkout.sessions.retrieve(session_id)
  } catch (err) {
    console.error('[subscription/link] Failed to retrieve Stripe session:', err)
    return NextResponse.json({ error: 'stripe_session_not_found' }, { status: 404 })
  }

  const stripeCustomerId = typeof stripeSession.customer === 'string'
    ? stripeSession.customer
    : null

  // Client Supabase service_role — cast as any pour éviter les `never` sur writes
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

  // Lookup le pending_checkout par stripe_session_id
  const { data: pending, error: lookupError } = await supabase
    .from('pending_checkouts')
    .select('id')
    .eq('stripe_session_id', session_id)
    .maybeSingle()

  if (lookupError) {
    console.error('[subscription/link] DB lookup error:', lookupError)
    return NextResponse.json({ error: 'db_lookup_failed' }, { status: 500 })
  }

  if (!pending) {
    // Pas de pending_checkout — pas de liaison à faire
    return NextResponse.json({ linked: false, reason: 'no_pending_checkout' })
  }

  // UPDATE le pending_checkout avec linked_user_id + stripe_customer_id
  const { error: updateError } = await supabase
    .from('pending_checkouts')
    .update({
      linked_user_id: user_id,
      ...(stripeCustomerId ? { stripe_customer_id: stripeCustomerId } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', pending.id)

  if (updateError) {
    console.error('[subscription/link] DB update error:', updateError)
    return NextResponse.json({ error: 'db_update_failed' }, { status: 500 })
  }

  return NextResponse.json({ linked: true })
}
