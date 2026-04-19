// ============================================================
// POST /api/webhooks/stripe
// Stripe sends raw event body — verified with webhook secret
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { verifyAndConstructEvent } from '@/lib/stripe/webhook'
import { getStripe, getPlanMessageLimit, isValidPlanId } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

function getServiceRoleClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return [] },
        setAll() {},
      },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  ) as ReturnType<typeof createServerClient>
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')

  let event: Stripe.Event
  try {
    const result = await verifyAndConstructEvent(rawBody, signature)
    event = result.event
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', (err as Error).message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log(`[Webhook] Processing event: ${event.type} (id=${event.id})`)

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event)
        break

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    console.error(`[Webhook] Handler error for ${event.type}:`, err)
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session

  const userId = session.client_reference_id ?? session.metadata?.userId
  const planId = session.metadata?.planId
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string

  if (!userId || !planId || !isValidPlanId(planId)) {
    console.error('[Webhook] checkout.session.completed: missing userId or planId', { userId, planId })
    return
  }

  const supabase = getServiceRoleClient()
  const messagesLimit = getPlanMessageLimit(planId)

  let periodStart: Date | null = null
  let periodEnd: Date | null = null

  if (subscriptionId) {
    try {
      const stripe = getStripe()
      const subscription = await stripe.subscriptions.retrieve(subscriptionId) as unknown as Stripe.Subscription & {
        current_period_start: number | null
        current_period_end: number | null
      }
      if (subscription.current_period_start) {
        periodStart = new Date(subscription.current_period_start * 1000)
      }
      if (subscription.current_period_end) {
        periodEnd = new Date(subscription.current_period_end * 1000)
      }
    } catch (err) {
      console.error('[Webhook] Failed to retrieve subscription:', err)
    }
  }

  const { error: subError } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      plan: planId,
      subscription_status: 'active',
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      current_period_start: periodStart?.toISOString() ?? null,
      current_period_end: periodEnd?.toISOString() ?? null,
      updated_at: new Date().toISOString(),
    })

  if (subError) {
    console.error('[Webhook] Failed to upsert user_subscriptions:', subError)
    return
  }

  const { error: usageError } = await supabase
    .from('monthly_usage')
    .upsert({
      user_id: userId,
      messages_sent: 0,
      messages_limit: messagesLimit,
      current_period_start: periodStart?.toISOString() ?? new Date().toISOString(),
      current_period_end: periodEnd?.toISOString() ?? null,
      updated_at: new Date().toISOString(),
    })

  if (usageError) {
    console.error('[Webhook] Failed to upsert monthly_usage:', usageError)
  }

  console.log(`[Webhook] checkout.session.completed: user=${userId} plan=${planId} ✓`)
}

async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as unknown as Stripe.Subscription & {
    current_period_start: number | null
    current_period_end: number | null
  }

  const customerId = subscription.customer as string
  const planId: string | undefined = subscription.metadata?.planId

  const statusMap: Record<string, string> = {
    active: 'active',
    trialing: 'trialing',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'past_due',
    incomplete: 'inactive',
    incomplete_expired: 'inactive',
  }
  const newStatus = statusMap[subscription.status] ?? 'inactive'

  const periodStart = subscription.current_period_start
    ? new Date(subscription.current_period_start * 1000).toISOString()
    : null
  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null

  const supabase = getServiceRoleClient()

  await supabase.rpc('update_user_quota', {
    p_user_id: null,
    p_plan: planId ?? null,
    p_messages_limit: planId && isValidPlanId(planId) ? getPlanMessageLimit(planId) : null,
    p_stripe_customer_id: customerId,
    p_stripe_subscription_id: subscription.id,
    p_current_period_start: periodStart,
    p_current_period_end: periodEnd,
    p_subscription_status: newStatus,
  })

  console.log(`[Webhook] subscription.updated: customer=${customerId} status=${newStatus} plan=${planId ?? 'unknown'} ✓`)
}

async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription
  const customerId = subscription.customer as string

  const supabase = getServiceRoleClient()

  await supabase
    .from('user_subscriptions')
    .update({
      subscription_status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId)

  console.log(`[Webhook] subscription.deleted: customer=${customerId} ✓`)
}
