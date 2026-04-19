import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe/config'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'missing signature' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'webhook secret not configured' }, { status: 500 })
  }

  const stripe = getStripe()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('[Webhook] signature verification failed:', err)
    return NextResponse.json({ error: 'webhook_error' }, { status: 400 })
  }

  try {
    await handleStripeEvent(event)
  } catch (err) {
    console.error(`[Webhook] handler error for event ${event.id}:`, err)
  }

  return NextResponse.json({ received: true })
}

async function handleStripeEvent(event: Stripe.Event) {
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

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as {
        id: string
        customer: string | null
        subscription: string | null
        metadata?: { planId?: string }
        customer_details?: { email?: string | null }
        expires_at: number | null
      }

      await supabase
        .from('stripe_sessions')
        .upsert(
          {
            stripe_session_id: session.id,
            stripe_customer_id: session.customer ?? null,
            stripe_subscription_id: session.subscription ?? null,
            plan: session.metadata?.planId ?? 'free',
            customer_email: session.customer_details?.email ?? null,
            confirmed: false,
            expires_at: session.expires_at
              ? new Date(session.expires_at * 1000).toISOString()
              : null,
          },
          { onConflict: 'stripe_session_id' }
        )
      break
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription & {
        current_period_start: number | null
        current_period_end: number | null
      }

      const customerId = subscription.customer

      const { data: sessionData } = await supabase
        .from('stripe_sessions')
        .select('stripe_customer_id, plan')
        .eq('stripe_customer_id', customerId)
        .maybeSingle()

      const planId = sessionData?.plan ?? 'free'
      const periodStart =
        subscription.current_period_start != null
          ? new Date(subscription.current_period_start * 1000).toISOString()
          : null
      const periodEnd =
        subscription.current_period_end != null
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null

      const { data: billing } = await supabase
        .from('user_billing')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .maybeSingle()

      if (!billing?.user_id) {
        console.error(`[Webhook] No user for customer ${customerId} — event ${event.id}`)
        return
      }

      const userId = billing.user_id

      await supabase.rpc('update_user_quota_if_allowed', {
        p_user_id: userId,
        p_plan: planId,
        p_messages_limit: getPlanMessageLimit(planId),
        p_stripe_customer_id: customerId,
        p_stripe_subscription_id: subscription.id,
        p_current_period_start: periodStart,
        p_current_period_end: periodEnd,
        p_subscription_status: subscription.status,
      })
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as { customer: string }
      const customerId = subscription.customer

      const { data: billing } = await supabase
        .from('user_billing')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .maybeSingle()

      if (!billing?.user_id) {
        return
      }

      await supabase
        .from('user_billing')
        .update({
          subscription_status: 'canceled',
          plan: 'free',
          messages_limit: 10,
          messages_used: 0,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', billing.user_id)
      break
    }

    default:
      break
  }
}

function getPlanMessageLimit(plan: string): number {
  const limits: Record<string, number> = {
    start: 10,
    scale: 50,
    team: 100,
  }
  return limits[plan] ?? 10
}
