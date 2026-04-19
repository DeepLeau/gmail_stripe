export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/stripe/webhook
 * Handles incoming Stripe webhook events.
 * Stripe signature verification is performed using the raw body buffer.
 */
export async function POST(request: NextRequest) {
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'missing_signature' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }

  let rawBody: string
  try {
    rawBody = await request.text()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  // Lazy-load stripe to avoid build-time crash when env vars are missing
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Stripe = require('stripe')

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
    apiVersion: '2026-03-25.dahlia',
    telemetry: false,
  })

  let event: import('stripe').default.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 })
  }

  const supabase = await createClient()

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as import('stripe').default.Subscription
      const userId = subscription.metadata?.supabase_user_id
      if (userId) {
        const plan = subscription.metadata?.plan ?? 'free'
        await supabase.from('user_billing').upsert(
          {
            user_id: userId,
            plan,
            subscription_status: subscription.status,
            messages_limit: 100,
            messages_used: 0,
            pending_checkout_session_id: null,
          },
          { onConflict: 'user_id' }
        )
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as import('stripe').default.Subscription
      const userId = subscription.metadata?.supabase_user_id
      if (userId) {
        await supabase
          .from('user_billing')
          .update({
            plan: 'free',
            subscription_status: 'inactive',
            messages_limit: 100,
            messages_used: 0,
            pending_checkout_session_id: null,
          })
          .eq('user_id', userId)
      }
      break
    }

    case 'checkout.session.completed': {
      const session = event.data.object as import('stripe').default.Checkout.Session
      const userId = session.metadata?.supabase_user_id
      if (userId && session.customer) {
        await supabase.from('user_billing').upsert(
          {
            user_id: userId,
            stripe_customer_id: session.customer as string,
            pending_checkout_session_id: null,
          },
          { onConflict: 'user_id' }
        )
      }
      break
    }

    default:
      break
  }

  return NextResponse.json({ received: true })
}
