'use server'

import type Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { getStripe, getPriceId, isValidPlan, type StripePlanName } from '@/lib/stripe/config'
import { redirect } from 'next/navigation'

export async function createCheckoutSession(plan: string): Promise<string | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  if (!isValidPlan(plan)) {
    return null
  }

  const stripe = getStripe()
  const priceId = getPriceId(plan as StripePlanName)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/chat?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/pricing`,
    client_reference_id: user.id,
    metadata: {
      user_id: user.id,
      plan_id: plan,
    },
  })

  return session.url
}

export async function linkStripeSessionToUser(
  sessionId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const stripe = getStripe()
    const supabase = await createClient()

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    })

    if (!session || session.payment_status === 'unpaid') {
      return { success: false, error: 'Session non valide ou paiement non confirmé' }
    }

    const customerId = session.customer as string
    const subscription = session.subscription as
      | (Stripe.Subscription & {
          current_period_start: number | null
          current_period_end: number | null
        })
      | null

    const plan = (session.metadata?.plan_id ?? 'start') as StripePlanName
    const messagesLimit =
      plan === 'start' ? 10 : plan === 'scale' ? 50 : plan === 'team' ? 100 : 10

    const periodStart = subscription?.current_period_start
      ? new Date(subscription.current_period_start * 1000).toISOString()
      : null
    const periodEnd = subscription?.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null

    // Upsert via RPC
    const { error: rpcError } = await supabase.rpc('apply_subscription_change', {
      p_stripe_customer_id: customerId,
      p_stripe_session_id: sessionId,
      p_plan: plan,
      p_messages_limit: messagesLimit,
      p_stripe_subscription_id: subscription?.id ?? null,
      p_current_period_start: periodStart,
      p_current_period_end: periodEnd,
      p_status: subscription?.status ?? 'active',
      p_messages_used_to_reset: null,
    })

    if (rpcError) {
      return { success: false, error: 'Erreur de base de données' }
    }

    return { success: true }
  } catch (err) {
    console.error('[linkStripeSessionToUser]', err)
    return { success: false, error: 'Erreur lors de la liaison du paiement' }
  }
}
