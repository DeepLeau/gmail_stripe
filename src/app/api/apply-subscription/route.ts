import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const stripeSessionId: string = body.stripe_session_id ?? body.session_id ?? ''

  if (!stripeSessionId) {
    return NextResponse.json({ error: 'Missing stripe_session_id' }, { status: 400 })
  }

  const { data, error } = await supabase.rpc('apply_subscription_change', {
    p_user_id: user.id,
    p_plan: null,
    p_units_limit: null,
    p_stripe_customer_id: '',
    p_stripe_subscription_id: '',
    p_stripe_session_id: stripeSessionId,
    p_subscription_status: 'active',
    p_current_period_start: null,
    p_current_period_end: null,
    p_customer_email: user.email ?? '',
    p_reset_units: false,
  })

  if (error) {
    console.error('[apply-subscription] RPC error:', error)
    return NextResponse.json({ error: 'Failed to apply subscription' }, { status: 500 })
  }

  const result = data as { success?: boolean; error?: string; code?: string } | null

  if (result && 'error' in result && result.error) {
    if (result.code === 'SESSION_EXPIRED') {
      return NextResponse.json({ error: 'Session expired, please checkout again' }, { status: 410 })
    }
    if (result.code === 'INVALID_PLAN') {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
