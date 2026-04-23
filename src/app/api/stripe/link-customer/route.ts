import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/config'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let userId: string
  let stripeCustomerId: string

  try {
    const body = await request.json()
    userId = body.userId
    stripeCustomerId = body.stripeCustomerId
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!userId || !stripeCustomerId) {
    return NextResponse.json({ error: 'userId and stripeCustomerId are required' }, { status: 400 })
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

  const { data: existingSub, error: selectError } = await supabase
    .from('user_subscriptions')
    .select('id')
    .eq('stripe_customer_id', stripeCustomerId)
    .is('user_id', null)
    .maybeSingle()

  if (selectError) {
    console.error('[link-customer] Failed to query user_subscriptions:', selectError)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  if (!existingSub) {
    return NextResponse.json({ error: 'No pending subscription found for this customer' }, { status: 404 })
  }

  const { error: updateError } = await supabase
    .from('user_subscriptions')
    .update({ user_id: userId, subscription_status: 'active' })
    .eq('id', existingSub.id)

  if (updateError) {
    console.error('[link-customer] Failed to link subscription:', updateError)
    return NextResponse.json({ error: 'Failed to link subscription' }, { status: 500 })
  }

  const stripe = getStripe()
  try {
    const customer = await stripe.customers.retrieve(stripeCustomerId)
    if (customer.deleted) {
      return NextResponse.json({ error: 'Stripe customer deleted' }, { status: 400 })
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      limit: 1,
      status: 'active',
    })

    if (subscriptions.data.length > 0) {
      const rawSub = subscriptions.data[0]
      const sub = rawSub as typeof rawSub & {
        current_period_start: number | null
        current_period_end: number | null
      }

      await supabase.rpc('apply_subscription_change', {
        p_user_id: userId,
        p_stripe_customer_id: stripeCustomerId,
        p_stripe_subscription_id: sub.id,
        p_session_id: null,
        p_messages_limit: null,
        p_current_period_start: sub.current_period_start != null
          ? new Date(sub.current_period_start * 1000).toISOString()
          : null,
        p_current_period_end: sub.current_period_end != null
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null,
        p_subscription_status: sub.status,
        p_plan: null,
      })
    }
  } catch (err) {
    console.error('[link-customer] Stripe sync failed, will be retried by webhook:', err)
  }

  return NextResponse.json({ success: true })
}
