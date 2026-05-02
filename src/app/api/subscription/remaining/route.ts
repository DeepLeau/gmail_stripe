import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: subscription, error } = await supabase
    .from('user_subscriptions')
    .select('plan, units_limit, units_used, subscription_status')
    .eq('user_id', user.id)
    .single()

  if (error || !subscription) {
    // No subscription found — treat as free tier
    return NextResponse.json({
      plan: null,
      units_limit: null,
      units_used: 0,
      remaining: null,
      subscription_status: 'free',
    })
  }

  const remaining =
    subscription.units_limit !== null
      ? Math.max(0, subscription.units_limit - subscription.units_used)
      : null

  return NextResponse.json({
    plan: subscription.plan,
    units_limit: subscription.units_limit,
    units_used: subscription.units_used,
    remaining,
    subscription_status: subscription.subscription_status,
  })
}
