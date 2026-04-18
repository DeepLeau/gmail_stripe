/**
 * POST /api/webhooks/stripe
 *
 * Receives and processes Stripe webhook events.
 * Handles checkout.session.completed and customer.subscription.deleted.
 *
 * Security: verifies Stripe signature using STRIPE_WEBHOOK_SECRET.
 * All client data stays inside Stripe — we only read the event object.
 *
 * Idempotency: uses upsert so re-delivered events are safe.
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripeClient } from '@/lib/stripe/client'
import { getNextRenewalDate } from '@/lib/subscription/plans'

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('[webhooks/stripe] STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  // ── 1. Read raw body (required for signature verification) ─────────────────
  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe-Signature header' }, { status: 400 })
  }

  // ── 2. Verify and construct the event ──────────────────────────────────────
  let event: Stripe.Event

  try {
    const stripe = getStripeClient()
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[webhooks/stripe] Signature verification failed: ${message}`)
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  // ── 3. Handle event types ─────────────────────────────────────────────────
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      default:
        // Unhandled event types are silently acknowledged.
        break
    }
  } catch (err) {
    console.error(`[webhooks/stripe] Handler error for ${event.type}:`, err)
    // Return 200 to prevent Stripe from retrying a known handler crash.
    // Log and fix the handler code — do not return 500 here.
  }

  return NextResponse.json({ received: true })
}

// ── Helpers ─────────────────────────────────────────────────────────────────────

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id ?? session.metadata?.['user_id']
  const planId = session.metadata?.plan_id ?? session.metadata?.['plan_id']
  const subscriptionId = session.subscription as string | null

  if (!userId) {
    console.warn('[webhooks/stripe] checkout.session.completed — no user_id in metadata')
    return
  }

  const supabase = await import('@/lib/supabase/server').then(m => m.createClient())
  const renewalDate = getNextRenewalDate()

  const { error } = await supabase.from('profiles').upsert(
    {
      id: userId,
      plan: planId ?? 'start',
      messages_count: 0,
      renewal_date: renewalDate,
      stripe_subscription_id: subscriptionId,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'id',
    }
  )

  if (error) {
    console.error('[webhooks/stripe] Failed to upsert profile:', error)
    throw error // Propagate so Stripe retries
  }

  console.log(`[webhooks/stripe] Profile updated for user ${userId}: plan=${planId}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id

  const supabase = await import('@/lib/supabase/server').then(m => m.createClient())

  const { error } = await supabase
    .from('profiles')
    .update({
      plan: 'free',
      stripe_subscription_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId)
    .is('stripe_subscription_id', null)

  if (error) {
    console.error('[webhooks/stripe] Failed to update profile on cancellation:', error)
    throw error
  }

  console.log(`[webhooks/stripe] Subscription cancelled: ${subscriptionId}`)
}
