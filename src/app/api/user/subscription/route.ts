import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('plan, subscription_status, units_limit, units_used, current_period_start, current_period_end')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!sub) {
    return NextResponse.json({
      plan: null,
      status: 'none',
      units_limit: 0,
      units_used: 0,
      units_remaining: 0,
    })
  }

  const unitsRemaining = Math.max(0, (sub.units_limit ?? 0) - (sub.units_used ?? 0))

  return NextResponse.json({
    plan: sub.plan,
    status: sub.subscription_status,
    units_limit: sub.units_limit ?? 0,
    units_used: sub.units_used ?? 0,
    units_remaining: unitsRemaining,
    current_period_start: sub.current_period_start,
    current_period_end: sub.current_period_end,
  })
}
