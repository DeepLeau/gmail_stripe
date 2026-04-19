import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select(
      'plan, messages_limit, messages_used, current_period_start, current_period_end'
    )
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('[Quota GET] Error:', error)
    return NextResponse.json({ error: 'failed to fetch quota' }, { status: 500 })
  }

  if (!data) {
    // No subscription — return free plan defaults
    return NextResponse.json({
      plan: 'start',
      messages_limit: 10,
      messages_used: 0,
      messages_remaining: 10,
      current_period_start: null,
      current_period_end: null,
    })
  }

  return NextResponse.json({
    plan: data.plan,
    messages_limit: data.messages_limit,
    messages_used: data.messages_used,
    messages_remaining: Math.max(0, data.messages_limit - data.messages_used),
    current_period_start: data.current_period_start,
    current_period_end: data.current_period_end,
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: { action?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid request body' }, { status: 400 })
  }

  if (body.action !== 'decrement') {
    return NextResponse.json({ error: 'invalid action' }, { status: 400 })
  }

  // Try atomic RPC first
  try {
    const { data, error } = await supabase.rpc('decrement_quota', {
      target_user_id: user.id,
    })

    if (!error && data) {
      return NextResponse.json({
        allowed: data.allowed,
        messages_remaining: data.messages_remaining,
      })
    }
  } catch {
    // RPC not available, fall back to manual check
  }

  // Fallback: manual atomic check via update with a condition
  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('messages_used, messages_limit')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!sub) {
    // Free user: allow up to 10 messages
    return NextResponse.json({ allowed: true, messages_remaining: 9 })
  }

  if (sub.messages_used >= sub.messages_limit) {
    return NextResponse.json({ allowed: false, messages_remaining: 0 })
  }

  // Increment used
  const { error: updateError } = await supabase
    .from('user_subscriptions')
    .update({ messages_used: sub.messages_used + 1, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('messages_used', sub.messages_used) // optimistic lock

  if (updateError) {
    console.error('[Quota POST] Update error:', updateError)
    return NextResponse.json({ allowed: false, messages_remaining: 0 })
  }

  return NextResponse.json({
    allowed: true,
    messages_remaining: sub.messages_limit - sub.messages_used - 1,
  })
}
