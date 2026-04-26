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

  const { data: billing, error: billingError } = await supabase
    .from('user_subscriptions')
    .select('plan, units_limit, current_period_end, subscription_status')
    .eq('user_id', user.id)
    .single()

  if (billingError || !billing) {
    // No subscription — return free defaults
    return NextResponse.json({
      plan: null,
      messagesLimit: 0,
      messagesUsed: 0,
      periodEnd: null,
    })
  }

  const now = new Date()
  const periodEnd = billing.current_period_end ? new Date(billing.current_period_end) : null

  // If period has ended, reset units_used
  if (periodEnd && now > periodEnd) {
    await supabase
      .from('user_subscriptions')
      .update({ units_used: 0 })
      .eq('user_id', user.id)

    return NextResponse.json({
      plan: billing.plan,
      messagesLimit: billing.units_limit,
      messagesUsed: 0,
      periodEnd: billing.current_period_end,
    })
  }

  const { data: usage } = await supabase
    .from('user_subscriptions')
    .select('units_used')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({
    plan: billing.plan,
    messagesLimit: billing.units_limit,
    messagesUsed: usage?.units_used ?? 0,
    periodEnd: billing.current_period_end,
  })
}
