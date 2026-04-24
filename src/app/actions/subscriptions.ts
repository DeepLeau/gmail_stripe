'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function linkStripeSessionToUser(sessionId: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const stripe = (await import('@/lib/stripe/config')).getStripe()
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  if (!session) {
    throw new Error('Invalid session ID')
  }

  const priceId = session.line_items?.data[0]?.price?.id ?? null
  const priceToPlanMap: Record<string, string> = {
    [process.env.STRIPE_START_PRICE_ID ?? '']: 'start',
    [process.env.STRIPE_SCALE_PRICE_ID ?? '']: 'scale',
    [process.env.STRIPE_TEAM_PRICE_ID ?? '']: 'team',
  }
  const planId = priceId ? (priceToPlanMap[priceId] ?? 'start') : 'start'

  const { getPlanLimit } = await import('@/lib/stripe/config')
  const messagesLimit = getPlanLimit(planId as 'start' | 'scale' | 'team')

  await supabase.rpc('apply_subscription_change', {
    p_stripe_session_id: sessionId,
    p_stripe_customer_id: session.customer as string | null,
    p_stripe_subscription_id: session.subscription as string | null,
    p_plan: planId,
    p_messages_limit: messagesLimit,
    p_current_period_start: null,
    p_current_period_end: null,
    p_status: 'active',
  })
}

export async function sendMessage(content: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('messages_limit, messages_used, plan')
    .eq('user_id', user.id)
    .single()

  const messagesLimit = subscription?.messages_limit ?? 10
  const messagesUsed = subscription?.messages_used ?? 0
  const remaining = messagesLimit - messagesUsed

  if (remaining <= 0) {
    return Response.json({ error: 'Limit reached' }, { status: 403 })
  }

  await supabase.rpc('decrement_message_count', {
    p_user_id: user.id,
  })

  return Response.json({ success: true, remaining: remaining - 1 })
}
