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

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('plan, units_used, units_limit, subscription_status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('[subscription/status] DB error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'No active subscription' }, { status: 404 })
  }

  return NextResponse.json({
    plan: data.plan,
    messages_limit: data.units_limit,
    messages_used: data.units_used,
    remaining:
      data.units_limit !== null
        ? Math.max(0, data.units_limit - data.units_used)
        : null,
  })
}
