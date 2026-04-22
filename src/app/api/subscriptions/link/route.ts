import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/config'
import { createServerClient } from '@supabase/ssr'
import type Stripe from 'stripe'

export const dynamic = 'force-dynamic'

interface LinkSessionBody {
  sessionId: string
  userId: string
}

function getSupabaseServiceRole() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  ) as any
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await import('@/lib/supabase/server').then(m => m.createClient())
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body: LinkSessionBody = await req.json()
    const { sessionId, userId } = body

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid sessionId' },
        { status: 400 }
      )
    }

    if (userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: userId does not match authenticated user' },
        { status: 401 }
      )
    }

    const stripe = getStripe()
    let stripeSession: Stripe.Checkout.Session

    try {
      stripeSession = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription'],
      })
    } catch (err) {
      console.error('[Link] Failed to retrieve Stripe session:', err)
      return NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 404 }
      )
    }

    if (stripeSession.metadata?.user_id && stripeSession.metadata.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Session does not belong to this user' },
        { status: 403 }
      )
    }

    const plan = (stripeSession.metadata?.plan ?? 'start') as 'start' | 'scale' | 'team'
    const messagesLimit = plan === 'start' ? 10 : plan === 'scale' ? 50 : 100

    const stripeCustomerId = stripeSession.customer as string | null
    const stripeSubscriptionId = (stripeSession.subscription as Stripe.Subscription | null)?.id ?? null

    const subscriptionObj = stripeSession.subscription as (Stripe.Subscription & { current_period_start: number | null; current_period_end: number | null }) | null
    const currentPeriodEnd = subscriptionObj
      ? new Date(subscriptionObj.current_period_end != null ? subscriptionObj.current_period_end * 1000 : Date.now() + 30 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    const serviceSupabase = getSupabaseServiceRole()

    const { error: rpcError } = await serviceSupabase.rpc('apply_subscription_change', {
      p_stripe_session_id: sessionId,
      p_stripe_customer_id: stripeCustomerId,
      p_stripe_subscription_id: stripeSubscriptionId,
      p_user_id: user.id,
      p_plan: plan,
      p_messages_limit: messagesLimit,
      p_current_period_end: currentPeriodEnd.toISOString(),
    })

    if (rpcError) {
      console.error('[Link] RPC error:', rpcError)
      return NextResponse.json(
        { error: 'Failed to link subscription. Please contact support.' },
        { status: 500 }
      )
    }

    const { data: subscription, error: fetchError } = await serviceSupabase
      .from('user_subscriptions')
      .select('plan, messages_limit, messages_used, current_period_end')
      .eq('user_id', user.id)
      .single()

    if (fetchError || !subscription) {
      return NextResponse.json({
        success: true,
        subscription: {
          plan,
          messages_limit: messagesLimit,
          messages_used: 0,
          current_period_end: currentPeriodEnd.toISOString(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      subscription: {
        plan: subscription.plan,
        messages_limit: subscription.messages_limit,
        messages_used: subscription.messages_used,
        current_period_end: subscription.current_period_end,
      },
    })
  } catch (error) {
    console.error('[Link] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
