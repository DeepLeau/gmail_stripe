import { NextRequest, NextResponse } from 'next/server'
import { getStripe, getPlanLimit, isValidPlan } from '@/lib/stripe/config'
import { createServerClient } from '@supabase/ssr'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    console.error('[Webhook] Missing stripe-signature header')
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
    console.error('[Webhook] Signature verification failed:', err)
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

  console.log(`[Webhook] Processing event: ${event.type} (${event.id})`)

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, supabase)
        break
      case 'customer.subscription.updated':
        await handleCustomerSubscriptionUpdated(
          event.data.object as Stripe.Subscription & {
            current_period_start: number | null
            current_period_end: number | null
          },
          supabase
        )
        break
      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    console.error(`[Webhook] Error handling ${event.type}:`, err)
  }

  return NextResponse.json({ received: true })
}

type StripePlanName = 'start' | 'scale' | 'team'

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  supabase: any
): Promise<void> {
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string | null

  const priceId =
    session.line_items?.data[0]?.price?.id ??
    (session.metadata?.plan_id as string | undefined) ??
    null

  const priceToPlanMap: Record<string, StripePlanName> = {
    [process.env.STRIPE_START_PRICE_ID ?? '']: 'start',
    [process.env.STRIPE_SCALE_PRICE_ID ?? '']: 'scale',
    [process.env.STRIPE_TEAM_PRICE_ID ?? '']: 'team',
  }
  const planId: StripePlanName = priceId ? (priceToPlanMap[priceId] ?? 'start') : 'start'

  const messagesLimit = getPlanLimit(planId)

  await supabase.rpc('apply_subscription_change', {
    p_stripe_session_id: session.id,
    p_stripe_customer_id: customerId,
    p_stripe_subscription_id: subscriptionId,
    p_plan: planId,
    p_messages_limit: messagesLimit,
    p_current_period_start: null,
    p_current_period_end: null,
    p_status: 'active',
  })

  console.log(
    `[Webhook] checkout.session.completed processed: session=${session.id}, customer=${customerId}, plan=${planId}`
  )
}

async function handleCustomerSubscriptionUpdated(
  subscription: Stripe.Subscription & {
    current_period_start: number | null
    current_period_end: number | null
  },
  supabase: any
): Promise<void> {
  const subscriptionId = subscription.id
  const customerId = subscription.customer as string

  const { data: existingSub } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle()

  if (!existingSub) {
    console.warn(
      `[Webhook] No subscription found for customer ${customerId} — event ${subscription.id}`
    )
    return
  }

  const status = subscription.status

  const priceId = subscription.items?.data[0]?.price?.id
  const priceToPlanMap: Record<string, StripePlanName> = {
    [process.env.STRIPE_START_PRICE_ID ?? '']: 'start',
    [process.env.STRIPE_SCALE_PRICE_ID ?? '']: 'scale',
    [process.env.STRIPE_TEAM_PRICE_ID ?? '']: 'team',
  }
  const planId: StripePlanName = priceId ? (priceToPlanMap[priceId] ?? 'start') : 'start'

  const messagesLimit = getPlanLimit(planId)

  const periodStart =
    subscription.current_period_start != null
      ? new Date(subscription.current_period_start * 1000).toISOString()
      : null
  const periodEnd =
    subscription.current_period_end != null
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null

  await supabase.rpc('apply_subscription_change', {
    p_stripe_session_id: null,
    p_stripe_customer_id: customerId,
    p_stripe_subscription_id: subscriptionId,
    p_plan: planId,
    p_messages_limit: messagesLimit,
    p_current_period_start: periodStart,
    p_current_period_end: periodEnd,
    p_status: status,
  })

  console.log(
    `[Webhook] customer.subscription.updated processed: subscription=${subscriptionId}, customer=${customerId}, status=${status}, plan=${planId}`
  )
}
