import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type Stripe from 'stripe'
import { getStripe, isValidPlan, PLAN_CONFIG } from '@/lib/stripe/config'

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
    return NextResponse.json({ error: 'server config error' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 })
  }

  // Service role client — bypasses RLS, needed for webhook writes
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
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session.customer as string
        const sessionId = session.id
        const customerEmail = session.customer_email ?? session.customer_details?.email ?? null

        if (!customerId) {
          console.error(`[Webhook] checkout.session.completed missing customer_id: ${event.id}`)
          return NextResponse.json({ received: true })
        }

        // Resolve plan from line_items price_id
        const priceId =
          session.line_items?.data[0]?.price?.id ?? null

        let planName: 'start' | 'scale' | 'team' = 'start'

        if (priceId) {
          const entry = Object.entries(PLAN_CONFIG).find(([, cfg]) => cfg.priceId === priceId)
          if (entry && isValidPlan(entry[0])) {
            planName = entry[0] as 'start' | 'scale' | 'team'
          } else {
            console.warn(`[Webhook] Price ID ${priceId} not in PLAN_CONFIG — defaulting to 'start'`)
          }
        }

        const messagesLimit = PLAN_CONFIG[planName].messagesLimit

        // Upsert with user_id NULL — will be linked later via link_stripe_session_to_user
        await supabase
          .from('user_subscriptions')
          .upsert({
            stripe_customer_id: customerId,
            stripe_session_id: sessionId,
            plan: planName,
            messages_limit: messagesLimit,
            messages_used: 0,
            subscription_status: 'active',
          }, {
            onConflict: 'stripe_customer_id',
          })

        console.log(`[Webhook] Stored checkout session ${sessionId} for customer ${customerId} (plan: ${planName})`)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription & {
          current_period_start: number | null
          current_period_end: number | null
        }

        const customerId = subscription.customer as string
        if (!customerId) {
          console.error(`[Webhook] No customer_id in subscription.updated: ${event.id}`)
          return NextResponse.json({ received: true })
        }

        // Resolve user_id via stripe_customer_id OR stripe_subscription_id
        const { data: subData } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .or(`stripe_customer_id.eq.${customerId},stripe_subscription_id.eq.${subscription.id}`)
          .maybeSingle()

        if (!subData?.user_id) {
          console.error(`[Webhook] No user for customer ${customerId} — event ${event.id}`)
          return NextResponse.json({ received: true })
        }

        const periodStart = subscription.current_period_start != null
          ? new Date(subscription.current_period_start * 1000).toISOString()
          : null
        const periodEnd = subscription.current_period_end != null
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null

        // Resolve plan from price_id in subscription items
        const priceId = subscription.items.data[0]?.price?.id ?? null
        let planName: 'start' | 'scale' | 'team' = 'start'

        if (priceId) {
          const entry = Object.entries(PLAN_CONFIG).find(([, cfg]) => cfg.priceId === priceId)
          if (entry && isValidPlan(entry[0])) {
            planName = entry[0] as 'start' | 'scale' | 'team'
          }
        }

        await supabase.rpc('apply_subscription_change', {
          p_user_id: subData.user_id,
          p_stripe_subscription_id: subscription.id,
          p_plan: planName,
          p_current_period_start: periodStart,
          p_current_period_end: periodEnd,
          p_subscription_status: subscription.status,
          p_stripe_customer_id: customerId,
        })

        console.log(`[Webhook] Applied subscription change for user ${subData.user_id}: plan=${planName}, status=${subscription.status}`)
        break
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    // Log but don't fail — Stripe will retry, idempotency handled by upsert/RPC
    console.error(`[Webhook] Error processing event ${event.id}:`, err)
  }

  return NextResponse.json({ received: true })
}
