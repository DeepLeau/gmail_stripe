import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { getStripe, getPlanLimit, isValidPlan, type StripePlanName } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

function createServiceRoleClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: (_cookies: { name: string; value: string; options: CookieOptions }[]) => {},
      },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  ) as ReturnType<typeof createServerClient>
}

function detectPlanFromPriceId(priceId: string): StripePlanName | null {
  if (priceId === process.env.STRIPE_PRICE_ID_START) return 'start'
  if (priceId === process.env.STRIPE_PRICE_ID_SCALE) return 'scale'
  if (priceId === process.env.STRIPE_PRICE_ID_TEAM) return 'team'
  return null
}

async function handleCheckoutSessionCompleted(
  event: Stripe.Event,
  supabase: NonNullable<ReturnType<typeof createServiceRoleClient>>
) {
  const session = event.data.object as Stripe.Checkout.Session

  const stripeSessionId = session.id
  const stripeCustomerId = session.customer as string
  const userIdFromRef = session.client_reference_id

  // Resolve plan from price_id
  const priceId = session.line_items?.data?.[0]?.price?.id ?? (session.metadata?.plan as string | undefined)
  const planName = typeof priceId === 'string' && isValidPlan(priceId)
    ? priceId
    : detectPlanFromPriceId(priceId ?? '')

  // Fallback to metadata
  const planFromMetadata = session.metadata?.plan as string | undefined
  const finalPlan: StripePlanName = (planName && isValidPlan(planName)) ? planName
    : (planFromMetadata && isValidPlan(planFromMetadata)) ? planFromMetadata
    : 'start'

  const messagesLimit = getPlanLimit(finalPlan)

  // user_id available via client_reference_id (flow authenticated checkout)
  const userId: string | null = userIdFromRef ?? null

  console.log(`[Webhook] checkout.session.completed — session=${stripeSessionId} customer=${stripeCustomerId} plan=${finalPlan} user_id=${userId ?? 'NULL'}`)

  await supabase.rpc('apply_subscription_change', {
    stripe_session_id: stripeSessionId,
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: null,
    plan: finalPlan,
    messages_limit: messagesLimit,
    subscription_status: 'active',
    current_period_start: new Date().toISOString(),
    current_period_end: null,
    is_renewal: false,
  })
}

async function handleSubscriptionUpdated(
  event: Stripe.Event,
  supabase: NonNullable<ReturnType<typeof createServiceRoleClient>>
) {
  const subscription = event.data.object as Stripe.Subscription & {
    current_period_start: number | null
    current_period_end: number | null
  }

  const stripeCustomerId = subscription.customer as string
  const stripeSubscriptionId = subscription.id
  const status = subscription.status
  const priceId = subscription.items.data[0]?.price?.id

  // Map Stripe status to our status
  const statusMap: Record<string, string> = {
    active: 'active',
    trialing: 'active',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'past_due',
    incomplete: 'inactive',
    incomplete_expired: 'inactive',
  }
  const subscriptionStatus = statusMap[status] ?? 'inactive'

  // Detect plan from price_id
  const planName = detectPlanFromPriceId(priceId ?? '')
  const finalPlan: StripePlanName = planName ?? 'start'
  const messagesLimit = getPlanLimit(finalPlan)

  // Detect renewal: period_start changed
  const currentPeriodStart = subscription.current_period_start != null
    ? new Date(subscription.current_period_start * 1000).toISOString()
    : new Date().toISOString()
  const currentPeriodEnd = subscription.current_period_end != null
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null

  // Resolve user_id from stripe_customer_id
  const { data: existingSub } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', stripeCustomerId)
    .maybeSingle()

  if (!existingSub) {
    console.warn(`[Webhook] No subscription row for customer ${stripeCustomerId} — event ${event.id} will be retried`)
    return
  }

  console.log(`[Webhook] subscription.updated — customer=${stripeCustomerId} sub=${stripeSubscriptionId} status=${subscriptionStatus} plan=${finalPlan}`)

  await supabase.rpc('apply_subscription_change', {
    stripe_session_id: null,
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: stripeSubscriptionId,
    plan: finalPlan,
    messages_limit: messagesLimit,
    subscription_status: subscriptionStatus,
    current_period_start: currentPeriodStart,
    current_period_end: currentPeriodEnd,
    is_renewal: false,
  })
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    console.error('[Webhook] Missing stripe-signature header')
    return NextResponse.json({ error: 'missing signature' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'webhook secret not configured' }, { status: 500 })
  }

  const stripe = getStripe()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error(`[Webhook] Signature verification failed: ${err}`)
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 })
  }

  const supabase = createServiceRoleClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event, supabase)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event, supabase)
        break

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    console.error(`[Webhook] Error handling ${event.type}: ${err}`)
  }

  return NextResponse.json({ received: true })
}
