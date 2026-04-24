import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import Stripe from 'stripe'
import { getStripe, getPlanLimit, STRIPE_PLANS, type StripePlanName } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

// --- Helpers ---

function createServiceSupabase(): ReturnType<typeof createServerClient> & { rpc: Function } {
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

async function resolveUserIdFromCustomerId(
  supabase: ReturnType<typeof createServiceSupabase>,
  customerId: string
): Promise<string | null> {
  const { data } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle()

  return data?.user_id ?? null
}

function timestampToTimestamptz(ts: number | null): string | null {
  if (ts == null) return null
  return new Date(ts * 1000).toISOString()
}

function mapPriceIdToPlan(priceId: string): StripePlanName | null {
  for (const [, config] of Object.entries(STRIPE_PLANS)) {
    if (config.priceId === priceId) return config.id
  }
  return null
}

// --- RPC: apply_subscription_change ---
async function rpcApplySubscriptionChange(
  supabase: ReturnType<typeof createServiceSupabase>,
  args: {
    stripe_customer_id?: string | null
    stripe_session_id?: string | null
    plan: StripePlanName
    messages_limit: number
    stripe_subscription_id?: string | null
    current_period_start?: string | null
    current_period_end?: string | null
    status: string
    messages_used_to_reset?: number | null
  }
): Promise<void> {
  await supabase.rpc('apply_subscription_change', {
    p_stripe_customer_id: args.stripe_customer_id ?? null,
    p_stripe_session_id: args.stripe_session_id ?? null,
    p_plan: args.plan,
    p_messages_limit: args.messages_limit,
    p_stripe_subscription_id: args.stripe_subscription_id ?? null,
    p_current_period_start: args.current_period_start ?? null,
    p_current_period_end: args.current_period_end ?? null,
    p_status: args.status,
    p_messages_used_to_reset: args.messages_used_to_reset ?? null,
  })
}

// --- Handler: checkout.session.completed ---
async function handleCheckoutCompleted(
  event: Stripe.Event,
  stripe: Stripe,
  supabase: ReturnType<typeof createServiceSupabase>
): Promise<void> {
  const session = event.data.object as Stripe.Checkout.Session

  const customerId = session.customer as string | null
  const sessionId = session.id
  const subscriptionId = session.subscription as string | null

  let plan: StripePlanName = 'start'
  let messagesLimit = getPlanLimit('start')

  // Resolve plan from subscription
  if (subscriptionId) {
    try {
      const subResponse = await stripe.subscriptions.retrieve(subscriptionId)
      const sub = subResponse as unknown as Stripe.Subscription
      const priceId = sub.items.data[0]?.price?.id
      if (priceId) {
        const resolvedPlan = mapPriceIdToPlan(priceId)
        if (resolvedPlan) {
          plan = resolvedPlan
          messagesLimit = getPlanLimit(resolvedPlan)
        }
      }
    } catch (err) {
      console.error(`[checkout.completed] Failed to retrieve subscription ${subscriptionId}:`, err)
    }
  }

  // Determine period dates if we have a subscription
  let periodStart: string | null = null
  let periodEnd: string | null = null
  let status = 'inactive'

  if (subscriptionId) {
    try {
      const subResponse = await stripe.subscriptions.retrieve(subscriptionId)
      const sub = subResponse as unknown as Stripe.Subscription & {
        current_period_start: number | null
        current_period_end: number | null
      }
      periodStart = timestampToTimestamptz(sub.current_period_start)
      periodEnd = timestampToTimestamptz(sub.current_period_end)
      status = sub.status
    } catch (err) {
      console.error(`[checkout.completed] Failed to retrieve subscription ${subscriptionId}:`, err)
    }
  }

  // Store subscription via RPC
  await rpcApplySubscriptionChange(supabase, {
    stripe_customer_id: customerId,
    stripe_session_id: sessionId,
    plan,
    messages_limit: messagesLimit,
    stripe_subscription_id: subscriptionId,
    current_period_start: periodStart,
    current_period_end: periodEnd,
    status: periodStart ? status : 'inactive',
  })

  console.log(`[checkout.completed] Session ${sessionId} — customer ${customerId} — plan ${plan}`)
}

// --- Handler: customer.subscription.updated ---
async function handleSubscriptionUpdated(
  event: Stripe.Event,
  stripe: Stripe,
  supabase: ReturnType<typeof createServiceSupabase>
): Promise<void> {
  const rawSubscription = event.data.object
  const subscription = rawSubscription as Stripe.Subscription & {
    current_period_start: number | null
    current_period_end: number | null
  }

  const customerId = subscription.customer as string
  const subscriptionId = subscription.id
  const priceId = subscription.items.data[0]?.price?.id
  const status = subscription.status

  const resolvedPlan = mapPriceIdToPlan(priceId ?? '') ?? 'start'
  const plan: StripePlanName = resolvedPlan
  const messagesLimit = getPlanLimit(resolvedPlan)

  // Resolve user_id from customer_id
  const userId = await resolveUserIdFromCustomerId(supabase, customerId)
  if (!userId) {
    console.error(`[subscription.updated] No user for customer ${customerId} — event ${event.id}`)
    return
  }

  const periodStart = timestampToTimestamptz(subscription.current_period_start)
  const periodEnd = timestampToTimestamptz(subscription.current_period_end)

  await rpcApplySubscriptionChange(supabase, {
    stripe_customer_id: customerId,
    stripe_session_id: null,
    plan,
    messages_limit: messagesLimit,
    stripe_subscription_id: subscriptionId,
    current_period_start: periodStart,
    current_period_end: periodEnd,
    status,
  })

  console.log(`[subscription.updated] customer ${customerId} — user ${userId} — plan ${plan} — status ${status}`)
}

// --- Handler: customer.subscription.deleted ---
async function handleSubscriptionDeleted(
  event: Stripe.Event,
  supabase: ReturnType<typeof createServiceSupabase>
): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription
  const customerId = subscription.customer as string

  const userId = await resolveUserIdFromCustomerId(supabase, customerId)
  if (!userId) {
    console.error(`[subscription.deleted] No user for customer ${customerId} — event ${event.id}`)
    return
  }

  await rpcApplySubscriptionChange(supabase, {
    stripe_customer_id: customerId,
    stripe_session_id: null,
    plan: 'start',
    messages_limit: getPlanLimit('start'),
    stripe_subscription_id: subscription.id,
    current_period_start: null,
    current_period_end: null,
    status: 'canceled',
  })

  console.log(`[subscription.deleted] customer ${customerId} — user ${userId} — subscription canceled`)
}

// --- Main route handler ---
export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'missing stripe-signature header' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'webhook secret not configured' }, { status: 500 })
  }

  const stripe = getStripe()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 })
  }

  const supabase = createServiceSupabase()

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event, stripe, supabase)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event, stripe, supabase)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event, supabase)
        break

      default:
        console.log(`[webhook] Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    // Log business errors but return 200 so Stripe doesn't retry
    console.error(`[webhook] Handler error for ${event.type}:`, err)
  }

  return NextResponse.json({ received: true })
}
