import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe, isValidPlan, getPlanLimit, type StripePlanName } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event: Stripe.Event
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'missing stripe-signature header' }, { status: 400 })
  }

  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    console.error('[Webhook] Signature verification failed:', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[Webhook] Missing Supabase service env vars')
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  // Use @supabase/ssr for server client in route handlers
  const { createServerClient } = await import('@supabase/ssr')
  const supabase = createServerClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(supabase, session)
        break
      }
      case 'customer.subscription.updated': {
        // Cast to extended shape to access current_period_start/end
        const subscription = event.data.object as Stripe.Subscription & {
          current_period_start: number | null
          current_period_end: number | null
        }
        await handleSubscriptionUpdated(supabase, subscription)
        break
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(supabase, subscription)
        break
      }
      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[Webhook] Handler error:', err)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(
  supabase: ReturnType<typeof import('@supabase/ssr')['createServerClient']>,
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.userId
  const plan = session.metadata?.plan

  if (!userId || !plan || !isValidPlan(plan)) {
    console.error('[Webhook] checkout.session.completed: missing userId or plan', {
      userId,
      plan,
    })
    return
  }

  const stripeCustomerId = session.customer as string
  const stripeSubscriptionId = session.subscription as string
  const messagesLimit = getPlanLimit(plan as StripePlanName)
  const periodStart = new Date().toISOString()

  const { error } = await supabase
    .from('user_subscriptions')
    .upsert(
      {
        user_id: userId,
        plan,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        subscription_status: 'active',
        messages_limit: messagesLimit,
        messages_used: 0,
        current_period_start: periodStart,
        current_period_end: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

  if (error) {
    console.error('[Webhook] upsert subscription error:', error)
  } else {
    console.log(`[Webhook] Subscription activated for user ${userId}, plan ${plan}`)
  }
}

async function handleSubscriptionUpdated(
  supabase: ReturnType<typeof import('@supabase/ssr')['createServerClient']>,
  subscription: Stripe.Subscription & {
    current_period_start: number | null
    current_period_end: number | null
  }
) {
  const subscriptionId = subscription.id
  const status = mapStripeStatus(subscription.status)
  const periodStart =
    subscription.current_period_start != null
      ? new Date(subscription.current_period_start * 1000).toISOString()
      : null
  const periodEnd =
    subscription.current_period_end != null
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null

  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      subscription_status: status,
      current_period_start: periodStart,
      current_period_end: periodEnd,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId)

  if (error) {
    console.error('[Webhook] subscription.updated error:', error)
  } else {
    console.log(`[Webhook] Subscription ${subscriptionId} updated to ${status}`)
  }
}

async function handleSubscriptionDeleted(
  supabase: ReturnType<typeof import('@supabase/ssr')['createServerClient']>,
  subscription: Stripe.Subscription
) {
  const subscriptionId = subscription.id

  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      subscription_status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId)

  if (error) {
    console.error('[Webhook] subscription.deleted error:', error)
  } else {
    console.log(`[Webhook] Subscription ${subscriptionId} canceled`)
  }
}

function mapStripeStatus(stripeStatus: string): string {
  const mapping: Record<string, string> = {
    active: 'active',
    trialing: 'active',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'past_due',
    incomplete: 'pending',
    incomplete_expired: 'canceled',
  }
  return mapping[stripeStatus] ?? 'pending'
}
