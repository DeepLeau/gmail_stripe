import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { session_id } = body as { session_id?: string }
  if (!session_id) {
    return NextResponse.json({ error: 'session_id required' }, { status: 400 })
  }

  const stripe = getStripe()
  let checkoutSession: Stripe.Checkout.Session
  try {
    checkoutSession = await stripe.checkout.sessions.retrieve(session_id)
  } catch {
    return NextResponse.json({ error: 'invalid_session' }, { status: 400 })
  }

  const customerId =
    typeof checkoutSession.customer === 'string'
      ? checkoutSession.customer
      : checkoutSession.customer?.id ?? null

  if (!customerId) {
    return NextResponse.json({ error: 'no_customer' }, { status: 400 })
  }

  // Update pending_checkout to link user
  const { error: updateError } = await supabase
    .from('pending_checkouts')
    .update({ linked_user_id: user.id })
    .eq('stripe_session_id', session_id)
    .is('linked_user_id', null)

  if (updateError) {
    console.error('[stripe/link] failed to update pending_checkouts:', updateError)
  }

  // Upsert user_subscriptions with this customer if not already linked
  const { error: upsertError } = await supabase
    .from('user_subscriptions')
    .upsert(
      { user_id: user.id, stripe_customer_id: customerId },
      { onConflict: 'user_id', ignoreDuplicates: true }
    )

  if (upsertError) {
    console.error('[stripe/link] failed to upsert user_subscriptions:', upsertError)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }

  return NextResponse.json({ success: true, customer_id: customerId })
}
