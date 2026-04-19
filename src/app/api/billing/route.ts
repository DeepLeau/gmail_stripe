import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/billing
 * Returns the current plan, quota usage, and subscription status for the authenticated user.
 * Returns: { plan, messages_used, messages_limit, quota_reset_at, subscription_status }
 * Errors: 401 unauthorized
 */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data: billing, error } = await supabase
    .from('user_billing')
    .select(
      'plan, messages_used, messages_limit, quota_reset_at, subscription_status'
    )
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('[GET /api/billing] DB error:', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }

  // Default values for users without a billing record (free plan)
  if (!billing) {
    return NextResponse.json({
      plan: 'free',
      messages_used: 0,
      messages_limit: 100,
      quota_reset_at: getDefaultQuotaReset(),
      subscription_status: 'inactive',
    })
  }

  return NextResponse.json({
    plan: billing.plan ?? 'free',
    messages_used: billing.messages_used ?? 0,
    messages_limit: billing.messages_limit ?? 100,
    quota_reset_at: billing.quota_reset_at ?? getDefaultQuotaReset(),
    subscription_status: billing.subscription_status ?? 'inactive',
  })
}

function getDefaultQuotaReset(): string {
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return nextMonth.toISOString()
}
