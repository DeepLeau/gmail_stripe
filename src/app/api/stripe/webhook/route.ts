import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import Stripe from 'stripe'
import { getStripe, isValidPlan, getPlanLimit, type StripePlanName } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

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

async function resolveUserId(
  supabase: ReturnType<typeof getSupabaseServiceRole>,
  stripeCustomerId: string
): Promise<string | null> {
  const { data } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', stripeCustomerId)
    .maybeSingle()

  return data?.user_id ?? null
}

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
  } catch {
    console.error('[Webhook] Invalid signature')
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 })
  }

  const supabase = getSupabaseServiceRole()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const subscription = session.subscription as string | (Stripe.Subscription & { current_period_start: number | null; current_period_end: number | null }) | null

        let planId: string | null = null
        if (subscription && typeof subscription === 'object' && subscription.items) {
          planId = subscription.items.data[0]?.price?.id ?? null
        }

        if (!planId && typeof subscription === 'string') {
          const fullSub = await stripe.subscriptions.retrieve(subscription)
          planId = fullSub.items.data[0]?.price?.id ?? null
        }

        let planName: StripePlanName | null = null
        if (planId) {
          for (const [name, config] of Object.entries({ start: { priceId: process.env.STRIPE_START_PRICE_ID }, scale: { priceId: process.env.STRIPE_SCALE_PRICE_ID }, team: { priceId: process.env.STRIPE_TEAM_PRICE_ID } })) {
            if ((config as { priceId: string }).priceId === planId) {
              planName = name as StripePlanName
              break
            }
          }
        }

        if (!planName) {
          console.error(`[Webhook] checkout.session.completed: could not resolve plan from priceId=${planId} for session=${session.id}`)
          return NextResponse.json({ received: true }, { status: 200 })
        }

        const stripeSessionId = session.id
        const stripeCustomerId = session.customer as string
        const stripeSubscriptionId =
          typeof subscription === 'string' ? subscription :
          subscription?.id ?? null

        const currentPeriodEnd =
          typeof subscription === 'object' && subscription?.current_period_end != null
            ? new Date(subscription.current_period_end * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

        const userId = await resolveUserId(supabase, stripeCustomerId)

        await supabase.rpc('apply_subscription_change', {
          p_stripe_session_id: stripeSessionId,
          p_stripe_customer_id: stripeCustomerId,
          p_stripe_subscription_id: stripeSubscriptionId,
          p_user_id: userId,
          p_plan: planName,
          p_messages_limit: getPlanLimit(planName),
          p_current_period_end: currentPeriodEnd,
        })

        console.log(
          `[Webhook] checkout.session.completed → session=${stripeSessionId} plan=${planName} user_id=${userId ?? 'orphan'}`
        )
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription & {
          current_period_start: number | null
          current_period_end: number | null
        }

        const stripeCustomerId = subscription.customer as string
        const stripeSubscriptionId = subscription.id
        const priceId = subscription.items.data[0]?.price?.id ?? null

        let planName: StripePlanName | null = null
        if (priceId) {
          for (const [name, config] of Object.entries({ start: { priceId: process.env.STRIPE_START_PRICE_ID }, scale: { priceId: process.env.STRIPE_SCALE_PRICE_ID }, team: { priceId: process.env.STRIPE_TEAM_PRICE_ID } })) {
            if ((config as { priceId: string }).priceId === priceId) {
              planName = name as StripePlanName
              break
            }
          }
        }

        if (!planName || !isValidPlan(planName)) {
          console.error(`[Webhook] customer.subscription.updated: could not resolve plan for subscription=${stripeSubscriptionId}`)
          return NextResponse.json({ received: true }, { status: 200 })
        }

        const userId = await resolveUserId(supabase, stripeCustomerId)

        if (!userId) {
          console.error(`[Webhook] customer.subscription.updated: no user found for customer=${stripeCustomerId} — event ${event.id}`)
          return NextResponse.json({ received: true }, { status: 200 })
        }

        const periodEnd =
          subscription.current_period_end != null
            ? new Date(subscription.current_period_end * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

        await supabase.rpc('apply_subscription_change', {
          p_stripe_session_id: null,
          p_stripe_customer_id: stripeCustomerId,
          p_stripe_subscription_id: stripeSubscriptionId,
          p_user_id: userId,
          p_plan: planName,
          p_messages_limit: getPlanLimit(planName),
          p_current_period_end: periodEnd,
        })

        console.log(
          `[Webhook] customer.subscription.updated → subscription=${stripeSubscriptionId} plan=${planName} user_id=${userId}`
        )
        break
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription & {
          current_period_start: number | null
          current_period_end: number | null
        }

        const stripeCustomerId = subscription.customer as string
        const stripeSubscriptionId = subscription.id
        const priceId = subscription.items.data[0]?.price?.id ?? null

        let planName: StripePlanName | null = null
        if (priceId) {
          for (const [name, config] of Object.entries({ start: { priceId: process.env.STRIPE_START_PRICE_ID }, scale: { priceId: process.env.STRIPE_SCALE_PRICE_ID }, team: { priceId: process.env.STRIPE_TEAM_PRICE_ID } })) {
            if ((config as { priceId: string }).priceId === priceId) {
              planName = name as StripePlanName
              break
            }
          }
        }

        if (!planName || !isValidPlan(planName)) {
          console.error(`[Webhook] customer.subscription.created: could not resolve plan for subscription=${stripeSubscriptionId}`)
          return NextResponse.json({ received: true }, { status: 200 })
        }

        const userId = await resolveUserId(supabase, stripeCustomerId)

        if (!userId) {
          console.error(`[Webhook] customer.subscription.created: no user found for customer=${stripeCustomerId} — event ${event.id}`)
          return NextResponse.json({ received: true }, { status: 200 })
        }

        const periodEnd =
          subscription.current_period_end != null
            ? new Date(subscription.current_period_end * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

        await supabase.rpc('apply_subscription_change', {
          p_stripe_session_id: null,
          p_stripe_customer_id: stripeCustomerId,
          p_stripe_subscription_id: stripeSubscriptionId,
          p_user_id: userId,
          p_plan: planName,
          p_messages_limit: getPlanLimit(planName),
          p_current_period_end: periodEnd,
        })

        console.log(
          `[Webhook] customer.subscription.created → subscription=${stripeSubscriptionId} plan=${planName} user_id=${userId}`
        )
        break
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    console.error(`[Webhook] Handler error for event ${event.type}:`, err)
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
