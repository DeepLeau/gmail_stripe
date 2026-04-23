import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'missing signature' }, { status: 400 })
  }

  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'webhook secret not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error(`[Webhook] Signature verification failed:`, err)
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 })
  }

  const supabase = createServerClient(
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

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(supabase, event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(supabase, event.data.object as unknown as Stripe.Subscription & {
          current_period_start: number | null
          current_period_end: number | null
        })
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(supabase, event.data.object as unknown as Stripe.Subscription & {
          current_period_start: number | null
          current_period_end: number | null
        })
        break

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    console.error(`[Webhook] Error handling event ${event.id}:`, err)
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutCompleted(
  supabase: any,
  session: Stripe.Checkout.Session
) {
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string
  const sessionId = session.id

  const userId = session.client_reference_id ?? session.metadata?.user_id ?? null

  let plan: string = 'start'
  if (session.metadata?.plan && ['start', 'scale', 'team'].includes(session.metadata.plan)) {
    plan = session.metadata.plan
  } else if (session.line_items?.data[0]?.price?.id) {
    const priceId = session.line_items.data[0].price.id
    const priceIdToPlan: Record<string, string> = {
      [process.env.STRIPE_PRICE_START ?? '']: 'start',
      [process.env.STRIPE_PRICE_SCALE ?? '']: 'scale',
      [process.env.STRIPE_PRICE_TEAM ?? '']: 'team',
    }
    plan = priceIdToPlan[priceId] ?? 'start'
  }

  let periodStart: string | null = null
  let periodEnd: string | null = null
  let subscriptionStatus = 'active'

  if (subscriptionId) {
    try {
      const subscriptionRaw = await getStripe().subscriptions.retrieve(subscriptionId)
      const subscription = subscriptionRaw as unknown as Stripe.Subscription & {
        current_period_start: number | null
        current_period_end: number | null
      }
      periodStart = subscription.current_period_start != null
        ? new Date(subscription.current_period_start * 1000).toISOString()
        : null
      periodEnd = subscription.current_period_end != null
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null
      subscriptionStatus = subscription.status
    } catch (err) {
      console.error(`[Webhook] Failed to retrieve subscription ${subscriptionId}:`, err)
    }
  }

  if (userId) {
    const { data: existing } = await supabase
      .from('user_subscriptions')
      .select('user_id')
      .eq('stripe_session_id', sessionId)
      .maybeSingle()

    if (existing?.user_id) {
      console.log(`[Webhook] Session ${sessionId} already linked to user ${existing.user_id}`)
      return
    }

    const result = await supabase.rpc('apply_subscription_change', {
      p_user_id: userId,
      p_plan: plan,
      p_stripe_customer_id: customerId,
      p_stripe_subscription_id: subscriptionId,
      p_stripe_session_id: sessionId,
      p_current_period_start: periodStart,
      p_current_period_end: periodEnd,
      p_subscription_status: subscriptionStatus,
    })

    if (result.error) {
      console.error(`[Webhook] RPC apply_subscription_change failed:`, result.error)
    } else {
      console.log(`[Webhook] Subscription created for user ${userId} via checkout session ${sessionId}`)
    }
  } else {
    const { error } = await supabase
      .from('user_subscriptions')
      .upsert({
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        stripe_session_id: sessionId,
        plan,
        messages_limit: plan === 'start' ? 10 : plan === 'scale' ? 50 : 100,
        messages_used: 0,
        current_period_start: periodStart,
        current_period_end: periodEnd,
        subscription_status: subscriptionStatus,
        created_by: null,
        updated_by: null,
      }, {
        onConflict: 'stripe_session_id',
        ignoreDuplicates: false,
      })

    if (error) {
      console.error(`[Webhook] Failed to store pre-signup subscription:`, error)
    } else {
      console.log(`[Webhook] Pre-signup subscription stored for customer ${customerId} (session ${sessionId})`)
    }
  }
}

async function handleSubscriptionUpdated(
  supabase: any,
  subscription: Stripe.Subscription & {
    current_period_start: number | null
    current_period_end: number | null
  }
) {
  const customerId = subscription.customer as string
  const subscriptionId = subscription.id
  const status = subscription.status

  const { data: existing } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle()

  if (!existing?.user_id) {
    const { data: bySubId } = await supabase
      .from('user_subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscriptionId)
      .maybeSingle()

    if (!bySubId?.user_id) {
      console.error(`[Webhook] No user found for customer ${customerId} or subscription ${subscriptionId}`)
      return
    }

    existing.user_id = bySubId.user_id
  }

  const priceId = subscription.items?.data[0]?.price?.id
  let plan = 'start'
  if (priceId) {
    const priceIdToPlan: Record<string, string> = {
      [process.env.STRIPE_PRICE_START ?? '']: 'start',
      [process.env.STRIPE_PRICE_SCALE ?? '']: 'scale',
      [process.env.STRIPE_PRICE_TEAM ?? '']: 'team',
    }
    plan = priceIdToPlan[priceId] ?? 'start'
  }

  const periodStart = subscription.current_period_start != null
    ? new Date(subscription.current_period_start * 1000).toISOString()
    : null
  const periodEnd = subscription.current_period_end != null
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null

  const result = await supabase.rpc('apply_subscription_change', {
    p_user_id: existing.user_id,
    p_plan: plan,
    p_stripe_customer_id: customerId,
    p_stripe_subscription_id: subscriptionId,
    p_stripe_session_id: null,
    p_current_period_start: periodStart,
    p_current_period_end: periodEnd,
    p_subscription_status: status,
  })

  if (result.error) {
    console.error(`[Webhook] RPC apply_subscription_change failed:`, result.error)
  } else {
    console.log(`[Webhook] Subscription ${subscriptionId} updated for user ${existing.user_id}`)
  }
}

async function handleSubscriptionDeleted(
  supabase: any,
  subscription: Stripe.Subscription & {
    current_period_start: number | null
    current_period_end: number | null
  }
) {
  const customerId = subscription.customer as string
  const subscriptionId = subscription.id

  const { data: existing } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle()

  if (!existing?.user_id) {
    const { data: bySubId } = await supabase
      .from('user_subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscriptionId)
      .maybeSingle()

    if (!bySubId?.user_id) {
      console.error(`[Webhook] No user found for customer ${customerId} or subscription ${subscriptionId}`)
      return
    }

    existing.user_id = bySubId.user_id
  }

  const result = await supabase.rpc('apply_subscription_change', {
    p_user_id: existing.user_id,
    p_plan: 'start',
    p_stripe_customer_id: customerId,
    p_stripe_subscription_id: subscriptionId,
    p_stripe_session_id: null,
    p_current_period_start: null,
    p_current_period_end: null,
    p_subscription_status: 'canceled',
  })

  if (result.error) {
    console.error(`[Webhook] RPC apply_subscription_change failed:`, result.error)
  } else {
    console.log(`[Webhook] Subscription ${subscriptionId} canceled for user ${existing.user_id}`)
  }
}
