import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/stripe/portal
 * Generates a Stripe Customer Portal session for subscription management.
 * Returns: { url: string } on success
 * Errors: 401 unauthorized | 500 stripe_error
 */
export async function POST(request: NextRequest) {
  // 1. Authenticate user
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // 2. Retrieve Stripe customer ID from user_billing
  const { data: billingRecord } = await supabase
    .from('user_billing')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  const stripeCustomerId = billingRecord?.stripe_customer_id

  if (!stripeCustomerId) {
    return NextResponse.json(
      { error: 'no_billing_record' },
      { status: 400 }
    )
  }

  // 3. Verify customer exists in Stripe and create portal session
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? `https://${request.headers.get('host') ?? 'localhost'}`

  let portalSessionUrl: string | null = null
  try {
    const stripe = await import('@/lib/stripe/server').then(m => m.createClient())
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${baseUrl}/chat`,
    })
    portalSessionUrl = session.url
  } catch (err) {
    console.error('[Stripe Portal] Failed to create session:', err)
    return NextResponse.json({ error: 'stripe_error' }, { status: 500 })
  }

  if (!portalSessionUrl) {
    return NextResponse.json({ error: 'stripe_error' }, { status: 500 })
  }

  return NextResponse.json({ url: portalSessionUrl })
}
