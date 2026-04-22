import Stripe from 'stripe'
import { getStripe } from './config'
import { createServerClient } from '@supabase/ssr'

/**
 * Verifies the Stripe webhook signature.
 */
export async function verifyStripeSignature(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Promise<Stripe.Event> {
  const stripe = getStripe()
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}

/**
 * Retrieves the raw body needed for webhook signature verification.
 */
export async function extractWebhookBody(req: Request): Promise<{ payload: string; signature: string }> {
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    throw new Error('Missing stripe-signature header')
  }
  const payload = await req.text()
  return { payload, signature }
}

/**
 * Creates a Supabase service-role client (bypasses RLS).
 */
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

/**
 * Handles checkout.session.completed webhook.
 */
export async function handleCheckoutSessionCompleted(
  event: Stripe.Checkout.Session
): Promise<void> {
  const stripe = getStripe()

  const session = await stripe.checkout.sessions.retrieve(event.id, {
    expand: ['subscription'],
  })

  const stripeSessionId = session.id
  const stripeCustomerId = session.customer as string | null
  const stripeSubscriptionId = (session.subscription as Stripe.Subscription | null)?.id ?? null

  const plan = session.metadata?.plan as 'start' | 'scale' | 'team' | undefined

  const subscriptionObj = session.subscription as (Stripe.Subscription & { current_period_start: number | null; current_period_end: number | null }) | null
  const currentPeriodEnd = subscriptionObj
    ? new Date(subscriptionObj.current_period_end != null ? subscriptionObj.current_period_end * 1000 : Date.now() + 30 * 24 * 60 * 60 * 1000)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  const userIdFromMetadata = session.metadata?.user_id as string | undefined

  const supabase = getSupabaseServiceRole()

  if (userIdFromMetadata) {
    await supabase.rpc('apply_subscription_change', {
      p_stripe_session_id: stripeSessionId,
      p_stripe_customer_id: stripeCustomerId,
      p_stripe_subscription_id: stripeSubscriptionId,
      p_user_id: userIdFromMetadata,
      p_plan: plan ?? 'start',
      p_messages_limit: plan === 'start' ? 10 : plan === 'scale' ? 50 : 100,
      p_current_period_end: currentPeriodEnd.toISOString(),
    })
  } else {
    await supabase.rpc('apply_subscription_change', {
      p_stripe_session_id: stripeSessionId,
      p_stripe_customer_id: stripeCustomerId,
      p_stripe_subscription_id: stripeSubscriptionId,
      p_user_id: null,
      p_plan: plan ?? 'start',
      p_messages_limit: plan === 'start' ? 10 : plan === 'scale' ? 50 : 100,
      p_current_period_end: currentPeriodEnd.toISOString(),
    })
  }
}

/**
 * Handles customer.subscription.updated webhook.
 */
export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription & {
    current_period_start: number | null
    current_period_end: number | null
  }
): Promise<void> {
  const stripeCustomerId = subscription.customer as string

  const plan = (subscription.metadata?.plan ?? 'start') as 'start' | 'scale' | 'team'
  const messagesLimit = plan === 'start' ? 10 : plan === 'scale' ? 50 : 100

  const currentPeriodEnd = subscription.current_period_end != null
    ? new Date(subscription.current_period_end * 1000)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  const supabase = getSupabaseServiceRole()

  const { error: updateError } = await supabase
    .from('user_subscriptions')
    .update({
      messages_used: 0,
      current_period_end: currentPeriodEnd.toISOString(),
    })
    .eq('stripe_customer_id', stripeCustomerId)

  if (updateError) {
    console.error('[Webhook] Failed to reset messages_used:', updateError)
    throw updateError
  }

  await supabase.rpc('apply_subscription_change', {
    p_stripe_session_id: null,
    p_stripe_customer_id: stripeCustomerId,
    p_stripe_subscription_id: subscription.id,
    p_user_id: null,
    p_plan: plan,
    p_messages_limit: messagesLimit,
    p_current_period_end: currentPeriodEnd.toISOString(),
  })
}
