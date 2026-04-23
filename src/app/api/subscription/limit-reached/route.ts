import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/subscription/limit-reached
 *
 * Returns the current user's subscription status and message usage.
 * Used by the chat header badge and the frontend to decide whether
 * to show the "limit reached" banner.
 *
 * Auth: Requires a valid Supabase session (cookie).
 *
 * Response:
 *  - 200 { plan, messages_limit, messages_used, remaining }
 *  - 401 { error: 'Unauthorized' }
 *  - 404 { error: 'No subscription found' }
 */
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
    .select('plan, messages_limit, messages_used, subscription_status')
    .eq('user_id', user.id)
    .eq('subscription_status', 'active')
    .single()

  if (error || !subscription) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
  }

  const messagesLimit = subscription.messages_limit ?? 10
  const messagesUsed = subscription.messages_used ?? 0
  const remaining = messagesLimit - messagesUsed

  return NextResponse.json({
    plan: subscription.plan,
    messages_limit: messagesLimit,
    messages_used: messagesUsed,
    remaining,
  })
}
