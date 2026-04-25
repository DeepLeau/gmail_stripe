import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { getStripe } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

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
    console.error('[Webhook] Invalid signature:', err)
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 })
  }

  // Service role Supabase client (bypasses RLS)
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
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Flow: anonymous payment — user creates account AFTER paying
        // Store {session_id, customer_id, plan, email} to link later via linkStripeSessionToUser
        const planSlug = session.metadata?.plan_slug as string || 'start'
        const customerId = session.customer as string
        const sessionId = session.id
        const customerEmail = session.customer_details?.email || session.customer_email || null

        await supabase.from('subscriptions').upsert({
          stripe_customer_id: customerId,
          stripe_session_id: sessionId,
          plan_slug: planSlug,
          messages_limit: getPlanLimit(planSlug),
          messages_used: 0,
          status: 'pending',
          // user_id intentionally null — linked later during account creation
        }, {
          onConflict: 'stripe_session_id',
        })

        console.log(`[Webhook] checkout.session.completed — session=${sessionId} plan=${planSlug}`)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription & {
          current_period_start: number | null
          current_period_end: number | null
        }

        const customerId = subscription.customer as string
        const subscriptionId = subscription.id
        const status = subscription.status === 'active' ? 'active'
          : subscription.status === 'past_due' ? 'past_due'
          : subscription.status === 'canceled' ? 'canceled'
          : subscription.status

        const periodStart = subscription.current_period_start != null
          ? new Date(subscription.current_period_start * 1000).toISOString()
          : null
        const periodEnd = subscription.current_period_end != null
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null

        // Resolve user_id from stripe_customer_id
        const { data: existing } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        if (!existing) {
          console.error(`[Webhook] No subscription found for customer ${customerId} — event ${event.id}`)
          break
        }

        if (!existing.user_id) {
          console.error(`[Webhook] Subscription exists but user_id is null for customer ${customerId} — cannot update. Event ${event.id}`)
          break
        }

        // Retrieve plan from price if available
        const priceId = subscription.items.data[0]?.price?.id
        const planSlug = priceId ? getPriceId(priceId) : 'start'

        await supabase.from('subscriptions').update({
          stripe_subscription_id: subscriptionId,
          plan_slug: planSlug,
          messages_limit: getPlanLimit(planSlug),
          status,
          current_period_start: periodStart,
          current_period_end: periodEnd,
          updated_at: new Date().toISOString(),
        }).eq('stripe_customer_id', customerId)

        console.log(`[Webhook] customer.subscription.updated — customer=${customerId} status=${status} plan=${planSlug}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Resolve user_id from stripe_customer_id
        const { data: existing } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        if (!existing) {
          console.error(`[Webhook] No subscription found for customer ${customerId} — event ${event.id}`)
          break
        }

        if (!existing.user_id) {
          console.error(`[Webhook] Subscription exists but user_id is null for customer ${customerId} — cannot update. Event ${event.id}`)
          break
        }

        await supabase.from('subscriptions').update({
          status: 'canceled',
          updated_at: new Date().toISOString(),
        }).eq('stripe_customer_id', customerId)

        console.log(`[Webhook] customer.subscription.deleted — customer=${customerId}`)
        break
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    // Log but don't return error — Stripe will retry and might cause duplicate events
    console.error(`[Webhook] Error handling ${event.type}:`, err)
  }

  // Return 200 immediately — Stripe timeout is 30s
  return NextResponse.json({ received: true })
}

// Import helpers from config
function getPlanLimit(planSlug: string): number {
  const limits: Record<string, number> = {
    start: 50,
    scale: 200,
    team: 500,
  }
  return limits[planSlug] ?? 50
}

function getPriceId(priceId: string): string {
  // Map Stripe price ID to plan slug
  const plans: Record<string, string> = {
    [process.env.STRIPE_PRICE_START!]: 'start',
    [process.env.STRIPE_PRICE_SCALE!]: 'scale',
    [process.env.STRIPE_PRICE_TEAM!]: 'team',
  }
  return plans[priceId] ?? 'start'
}
