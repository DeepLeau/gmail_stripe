import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isValidPlan, getPlanLimit, type StripePlanName } from '@/lib/stripe/config'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: { plan?: string; stripeSessionId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid request body' }, { status: 400 })
  }

  const { plan, stripeSessionId } = body

  if (!plan || !isValidPlan(plan)) {
    return NextResponse.json({ error: 'invalid plan' }, { status: 400 })
  }

  if (!stripeSessionId || typeof stripeSessionId !== 'string') {
    return NextResponse.json({ error: 'stripeSessionId is required' }, { status: 400 })
  }

  const messagesLimit = getPlanLimit(plan as StripePlanName)

  // Check if a subscription already exists for this user
  const { data: existing } = await supabase
    .from('user_subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'subscription already exists' }, { status: 400 })
  }

  // Insert pending subscription — webhook will update with Stripe data
  const { data, error } = await supabase
    .from('user_subscriptions')
    .insert({
      user_id: user.id,
      plan: plan as StripePlanName,
      stripe_session_id: stripeSessionId,
      subscription_status: 'pending',
      messages_limit: messagesLimit,
      messages_used: 0,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[Billing Init] Insert error:', error)
    return NextResponse.json({ error: 'failed to create subscription' }, { status: 500 })
  }

  return NextResponse.json({ subscription_id: data.id }, { status: 201 })
}
