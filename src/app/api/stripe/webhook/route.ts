/**
 * POST /api/stripe/webhook
 *
 * Reçoit les events Stripe bruts, vérifie la signature,
 * et met à jour Supabase via service_role.
 *
 * Events gérés :
 *   - checkout.session.completed   → crée/mise à jour subscription + message_usage
 *   - customer.subscription.deleted → marque la subscription comme inactive
 *   - customer.subscription.updated  → met à jour le statut
 *
 * Règles Stripe skill respectées :
 *   - request.text() pour raw body (PAS request.json())
 *   - stripe.webhooks.constructEvent() AVANT tout traitement
 *   - export const dynamic = 'force-dynamic' en tête
 *   - pas de config bodyParser (syntaxe Pages Router)
 *   - Supabase cast as any pour éviter les `never` sur writes
 */
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import {
  getStripe,
  getMessagesLimit,
  isValidPlan,
  type StripePlanId,
} from '@/lib/stripe/server'

export const dynamic = 'force-dynamic'

// ── Supabase service_role client ─────────────────────────────────────────────
// Cast as any pour éviter les `never` sur les writes (pas de Database generic)
function getServiceSupabase() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createServiceSupabaseRaw() as any
}

function createServiceSupabaseRaw() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set'
    )
  }

  // Dynamic import to avoid bundling issues with @supabase/ssr in edge/node contexts
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createServerClient } = require('@supabase/ssr')

  return createServerClient(supabaseUrl, serviceRoleKey, {
    cookies: {
      getAll() {
        return []
      },
      setAll() {
        // rien à faire côté cookies pour le webhook
      },
    },
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

// ── Types Stripe enrichis ────────────────────────────────────────────────────

type StripeSubscription = Stripe.Subscription & {
  current_period_start: number | null
  current_period_end: number | null
}

// ── Handler ──────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // ── Vérification early du secret ─────────────────────────────────────────
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  // ── Lecture du body brut ─────────────────────────────────────────────────
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  // ── Vérification de la signature ────────────────────────────────────────
  let event: Stripe.Event

  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : 'Webhook signature verification failed'
    console.error('[Webhook] Signature verification failed:', message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // ── Traitement de l'event ────────────────────────────────────────────────
  try {
    await handleEvent(event)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error processing event'
    console.error('[Webhook] Processing error:', message, {
      eventType: event.type,
      eventId: event.id,
    })
    return NextResponse.json({ received: true, error: message }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

// ── Event dispatcher ─────────────────────────────────────────────────────────

async function handleEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event)
      break

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event)
      break

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event)
      break

    default:
      break
  }
}

// ── checkout.session.completed ──────────────────────────────────────────────

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session

  if (session.mode !== 'subscription') return

  const rawPlanId = session.metadata?.planId ?? 'start'
  const planId: StripePlanId = isValidPlan(rawPlanId) ? rawPlanId : 'start'
  const userId = session.metadata?.userId ?? session.client_reference_id

  if (!userId) {
    console.warn('[Webhook] checkout.session.completed sans userId', {
      sessionId: session.id,
    })
    return
  }

  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id

  if (!subscriptionId) {
    console.warn('[Webhook] Pas de subscriptionId dans la session', {
      sessionId: session.id,
    })
    return
  }

  const supabase = getServiceSupabase()

  // ── Insert/update user_subscriptions ──────────────────────────────────
  const { error: subError } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      plan: planId,
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: session.customer as string,
      subscription_status: 'active',
      updated_at: new Date().toISOString(),
    })

  if (subError) {
    console.error('[Webhook] Erreur upsert user_subscriptions:', subError)
    throw subError
  }

  // ── Initialiser message_usage si pas encore présent ──────────────────────
  const messagesLimit = getMessagesLimit(planId)
  const { error: usageError } = await supabase
    .from('message_usage')
    .upsert(
      {
        user_id: userId,
        messages_sent: 0,
        messages_limit: messagesLimit,
        reset_at: getNextResetDate().toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    )

  if (usageError) {
    console.error('[Webhook] Erreur upsert message_usage:', usageError)
    throw usageError
  }

  console.log('[Webhook] checkout.session.completed processed', {
    userId,
    planId,
    subscriptionId,
  })
}

// ── customer.subscription.deleted ────────────────────────────────────────────

async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as StripeSubscription
  const subscriptionId = subscription.id

  const supabase = getServiceSupabase()

  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      plan: 'free',
      subscription_status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId)

  if (error) {
    console.error('[Webhook] Erreur update subscription.canceled:', error)
    throw error
  }

  const { error: usageError } = await supabase
    .from('message_usage')
    .update({
      messages_limit: getMessagesLimit('start'),
      messages_sent: 0,
      reset_at: getNextResetDate().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId)

  if (usageError) {
    console.error('[Webhook] Erreur update message_usage on cancel:', usageError)
    throw usageError
  }

  console.log('[Webhook] customer.subscription.deleted processed', {
    subscriptionId,
  })
}

// ── customer.subscription.updated ────────────────────────────────────────────

async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as StripeSubscription
  const subscriptionId = subscription.id
  const rawPlanId = subscription.metadata?.planId ?? 'start'
  const planId: StripePlanId = isValidPlan(rawPlanId) ? rawPlanId : 'start'
  const status = subscription.status

  const supabase = getServiceSupabase()

  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      plan: planId,
      subscription_status: status,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId)

  if (error) {
    console.error('[Webhook] Erreur update subscription.updated:', error)
    throw error
  }

  console.log('[Webhook] customer.subscription.updated processed', {
    subscriptionId,
    planId,
    status,
  })
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getNextResetDate(): Date {
  const now = new Date()
  const nextMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0)
  )
  return nextMonth
}
