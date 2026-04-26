import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // Fetch la subscription active de l'user
  const { data: subscription, error: subError } = await supabase
    .from('user_subscriptions')
    .select('plan, subscription_status, messages_limit')
    .eq('user_id', user.id)
    .eq('subscription_status', 'active')
    .maybeSingle()

  if (subError) {
    console.error('[billing/status] Failed to fetch subscription:', subError)
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  }

  if (!subscription) {
    return NextResponse.json({
      plan: null,
      messagesLimit: null,
      messagesUsed: null,
      status: null,
    })
  }

  // Fetch l'usage courant du mois
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const { data: usage, error: usageError } = await supabase
    .from('monthly_usage')
    .select('messages_used')
    .eq('user_id', user.id)
    .gte('period_start', monthStart)
    .maybeSingle()

  if (usageError) {
    console.error('[billing/status] Failed to fetch usage:', usageError)
  }

  return NextResponse.json({
    plan: subscription.plan,
    messagesLimit: subscription.messages_limit,
    messagesUsed: usage?.messages_used ?? 0,
    status: subscription.subscription_status,
  })
}
