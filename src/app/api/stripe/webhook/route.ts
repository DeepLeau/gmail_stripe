import { NextRequest, NextResponse } from 'next/server'
import { getStripe, isValidPlan, getPlanLimit, type StripePlanName } from '@/lib/stripe/config'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const stripe = getStripe()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode !== 'subscription') break

        const userId = session.client_reference_id
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string
        const plan = session.metadata?.plan as string | undefined

        if (!userId || !customerId) {
          console.log('[Webhook] checkout.session.completed: missing user_id or customer_id')
          break
        }

        if (!plan || !isValidPlan(plan)) {
          console.log('[Webhook] checkout.session.completed: invalid plan', plan)
          break
        }

        await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_session_id: session.id,
            stripe_subscription_id: subscriptionId,
            plan: plan,
            messages_limit: getPlanLimit(plan as StripePlanName),
            messages_used: 0,
            subscription_status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: null,
          }, {
            onConflict: 'stripe_session_id',
          })

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription & {
          current_period_start: number | null
          current_period_end: number | null
        }

        const customerId = subscription.customer as string
        const status = subscription.status

        const { data: existing } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!existing) {
          console.log('[Webhook] subscription.updated: no user for customer', customerId)
          break
        }

        const updates: Record<string, unknown> = {
          subscription_status: status,
        }

        if (subscription.current_period_start) {
          updates.current_period_start = new Date(subscription.current_period_start * 1000).toISOString()
        }

        if (subscription.current_period_end) {
          updates.current_period_end = new Date(subscription.current_period_end * 1000).toISOString()
        }

        if (status === 'active') {
          updates.messages_used = 0
        }

        await supabase
          .from('user_subscriptions')
          .update(updates)
          .eq('user_id', existing.user_id)

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: existing } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!existing) {
          break
        }

        await supabase
          .from('user_subscriptions')
          .update({
            subscription_status: 'canceled',
            stripe_subscription_id: null,
          })
          .eq('user_id', existing.user_id)

        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice

        if (invoice.billing_reason !== 'subscription_cycle') {
          break
        }

        const customerId = invoice.customer as string

        const { data: existing } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!existing) {
          break
        }

        await supabase
          .from('user_subscriptions')
          .update({
            messages_used: 0,
            subscription_status: 'active',
          })
          .eq('user_id', existing.user_id)

        break
      }

      default:
        console.log('[Webhook] Unhandled event type:', event.type)
    }
  } catch (error) {
    console.error('[Webhook] Error processing event:', error)
    return NextResponse.json({ error: 'Processing error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
