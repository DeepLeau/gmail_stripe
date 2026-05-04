import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getPlanLimit } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: () => request.cookies.get('sb-access-token')?.value,
        set: () => {},
        remove: () => {},
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  const { data: sub, error: subError } = await supabase
    .from('user_subscriptions')
    .select('plan, units_limit, units_used, subscription_status, current_period_end')
    .eq('user_id', user.id)
    .maybeSingle()

  if (subError) {
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  }

  if (!sub) {
    return NextResponse.json({
      plan: null,
      units_used: 0,
      units_limit: null,
      units_remaining: null,
      status: 'free',
      current_period_end: null,
    })
  }

  const limit = sub.units_limit ?? getPlanLimit(sub.plan as 'start' | 'scale' | 'team')
  const remaining = limit !== null ? Math.max(0, limit - (sub.units_used ?? 0)) : null

  return NextResponse.json({
    plan: sub.plan,
    units_used: sub.units_used ?? 0,
    units_limit: limit,
    units_remaining: remaining,
    status: sub.subscription_status ?? 'active',
    current_period_end: sub.current_period_end ?? null,
  })
}
