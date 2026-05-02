import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'invalid signature'
    console.error('[Webhook] Signature verification failed:', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  // Service role client — cast to any to avoid 'never' type issues on writes
  const { createServerClient } = await import('@supabase/ssr')
  const serviceSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return [] },
        setAll() {},
      },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  ) as any

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session & {
          metadata?: { plan_slug?: string }
        }

        const customerId = session.customer as string | null
        const subscriptionId = session.subscription as string | null
        const planSlug = session.metadata?.plan_slug ?? 'starter'

        let periodStart: string | null = null
        let periodEnd: string | null = null

        if (subscriptionId && customerId) {
          try {
            const stripe = getStripe()
            const sub = await stripe.subscriptions.retrieve(subscriptionId) as unknown as Stripe.Subscription & {
              current_period_start: number | null
              current_period_end: number | null
            }
            periodStart = sub.current_period_start != null
              ? new Date(sub.current_period_start * 1000).toISOString()
              : null
            periodEnd = sub.current_period_end != null
              ? new Date(sub.current_period_end * 1000).toISOString()
              : null
          } catch {
            // Non-fatal — continue without period dates
          }
        }

        const unitsMap: Record<string, number> = {
          starter: 50,
          growth: 200,
          pro: 1000,
          free: 0,
        }
        const units = unitsMap[planSlug] ?? 0

        await serviceSupabase.rpc('apply_subscription_change', {
          p_user_id: session.client_reference_id ?? '',
          p_plan: planSlug,
          p_stripe_customer_id: customerId ?? '',
          p_stripe_session_id: session.id,
          p_stripe_subscription_id: subscriptionId ?? '',
          p_customer_email: session.customer_details?.email ?? '',
          p_subscription_status: 'active',
          p_units_limit: units,
          p_current_period_start: periodStart ?? new Date().toISOString(),
          p_current_period_end: periodEnd ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          p_reset_units: false,
        })
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription & {
          current_period_start: number | null
          current_period_end: number | null
          metadata?: { plan_slug?: string }
        }

        const customerId = sub.customer as string
        const planSlug = sub.metadata?.plan_slug ?? sub.items.data[0]?.price?.metadata?.plan_slug ?? 'starter'
        const periodStart = sub.current_period_start != null
          ? new Date(sub.current_period_start * 1000).toISOString()
          : null
        const periodEnd = sub.current_period_end != null
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null

        const { data: existingSub } = await serviceSupabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        if (!existingSub?.user_id) {
          console.error('[Webhook] No user found for customer:', customerId)
          break
        }

        const unitsMap: Record<string, number> = {
          starter: 50,
          growth: 200,
          pro: 1000,
          free: 0,
        }
        const units = unitsMap[planSlug] ?? 0

        await serviceSupabase.rpc('apply_subscription_change', {
          p_user_id: existingSub.user_id,
          p_plan: planSlug,
          p_stripe_customer_id: customerId,
          p_stripe_session_id: '',
          p_stripe_subscription_id: sub.id,
          p_customer_email: '',
          p_subscription_status: sub.status,
          p_units_limit: units,
          p_current_period_start: periodStart ?? new Date().toISOString(),
          p_current_period_end: periodEnd ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          p_reset_units: false,
        })
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription & {
          current_period_start: number | null
          current_period_end: number | null
        }
        const customerId = sub.customer as string

        const { data: existingSub } = await serviceSupabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        if (!existingSub?.user_id) {
          console.error('[Webhook] No user found for deleted subscription:', customerId)
          break
        }

        await serviceSupabase.rpc('apply_subscription_change', {
          p_user_id: existingSub.user_id,
          p_plan: 'free',
          p_stripe_customer_id: customerId,
          p_stripe_session_id: '',
          p_stripe_subscription_id: sub.id,
          p_customer_email: '',
          p_subscription_status: 'canceled',
          p_units_limit: 0,
          p_current_period_start: new Date().toISOString(),
          p_current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          p_reset_units: true,
        })
        break
      }

      default:
        break
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook processing error'
    console.error('[Webhook] Error processing event:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}
