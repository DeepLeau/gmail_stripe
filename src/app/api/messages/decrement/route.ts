import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleSupabase } from '@/lib/supabase/service-role'

export async function POST() {
  // ── Auth check ──────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = user.id

  // ── Read subscription + usage ───────────────────────────────────────────────
  const serviceRoleSupabase = createServiceRoleSupabase()

  const { data: subscription, error: subError } = await serviceRoleSupabase
    .from('user_subscriptions')
    .select('plan, messages_limit, subscription_status')
    .eq('user_id', userId)
    .single()

  const { data: usage, error: usageError } = await serviceRoleSupabase
    .from('message_usage')
    .select('messages_sent, messages_limit')
    .eq('user_id', userId)
    .single()

  if (subError && subError.code !== 'PGRST116') {
    console.error('[/api/messages/decrement] subscription read error:', subError)
    return NextResponse.json({ error: 'Failed to read subscription' }, { status: 500 })
  }

  if (usageError && usageError.code !== 'PGRST116') {
    console.error('[/api/messages/decrement] usage read error:', usageError)
    return NextResponse.json({ error: 'Failed to read usage' }, { status: 500 })
  }

  // ── Determine effective plan and limit ───────────────────────────────────────
  const messagesLimit = usage?.messages_limit ?? subscription?.messages_limit ?? 10
  const messagesSent = usage?.messages_sent ?? 0
  const plan = subscription?.plan ?? 'free'
  const subscriptionStatus = subscription?.subscription_status ?? 'inactive'

  // ── Free/inactive plan: strict limit enforcement ─────────────────────────────
  if (plan === 'free' || subscriptionStatus === 'canceled' || subscriptionStatus === 'inactive') {
    if (messagesSent >= messagesLimit) {
      return NextResponse.json(
        { allowed: false, remaining: 0, plan },
        { status: 403 }
      )
    }
    // Fall through to allow one more message (grace for free users who just signed up)
  }

  // ── Check quota ─────────────────────────────────────────────────────────────
  if (messagesSent >= messagesLimit) {
    return NextResponse.json(
      { allowed: false, remaining: 0, plan },
      { status: 403 }
    )
  }

  // ── Increment counter ───────────────────────────────────────────────────────
  const { error: incrementError } = await serviceRoleSupabase
    .from('message_usage')
    .update({ messages_sent: messagesSent + 1 })
    .eq('user_id', userId)

  if (incrementError) {
    console.error('[/api/messages/decrement] increment error:', incrementError)
    return NextResponse.json({ error: 'Failed to update usage' }, { status: 500 })
  }

  const remaining = messagesLimit - messagesSent - 1
  return NextResponse.json({ allowed: true, remaining: Math.max(0, remaining) })
}
