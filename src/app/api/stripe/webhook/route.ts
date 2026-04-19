import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe/client'
import { PLAN_BY_PRICE_ID } from '@/lib/stripe/config'

/**
 * POST /api/stripe/webhook
 *
 * Endpoint reçoit les events Stripe.
 * Vérifie la signature avec STRIPE_WEBHOOK_SECRET.
 * Traite checkout.session.completed pour lier l'abonnement au compte Supabase.
 *
 * Security : la signature est vérifiée AVANT tout traitement.
 * L'écriture en DB utilise le service_role Supabase pour bypass RLS.
 */
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  // ── Lire le body brut (non parsé) pour la vérification de signature ──
  // Stripe nécessite le body exact — on ne peut pas utiliser req.json()
  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  // ── Vérifier la signature ─────────────────────────────────────────
  const stripe = getStripe()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Invalid webhook signature'
    console.error('[Stripe Webhook] Signature verification failed:', message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // ── Traiter l'event ────────────────────────────────────────────────
  try {
    await handleEvent(event)
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Event processing error'
    console.error(`[Stripe Webhook] Error processing event ${event.type}:`, message)
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

/**
 * Dispatch l'event vers le handler approprié.
 */
async function handleEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(
        event.data.object as Stripe.Checkout.Session
      )
      break

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(
        event.data.object as Stripe.Subscription
      )
      break

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(
        event.data.object as Stripe.Subscription
      )
      break

    // Ignorer les autres events — pas d'erreur pour events inconnus
    default:
      console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`)
  }
}

/**
 * checkout.session.completed
 *
 * Se déclenche quand le paiement Stripe est confirmé.
 * On récupère le customer_id + subscription_id, on lie à l'utilisateur.
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  if (session.mode !== 'subscription') return

  const userId = session.metadata?.userId
  if (!userId) {
    console.warn('[Stripe Webhook] Session without userId metadata:', session.id)
    return
  }

  // Récupérer le customer et subscription Stripe
  // La session contient customer et subscription une fois le paiement confirmé
  const customerId =
    typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id

  if (!customerId) {
    console.warn('[Stripe Webhook] Session without customer:', session.id)
    return
  }

  const stripe = getStripe()

  // Récupérer la subscription active pour ce customer
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    limit: 1,
    status: 'active',
  })

  const subscription = subscriptions.data[0]
  if (!subscription) {
    console.warn(
      '[Stripe Webhook] No active subscription found for customer:',
      customerId
    )
    return
  }

  // Identifier le plan via le price_id de la subscription
  const priceId =
    subscription.items.data[0]?.price?.id ?? session.metadata?.planName

  if (!priceId) {
    console.warn('[Stripe Webhook] No price ID found in subscription')
    return
  }

  const plan = PLAN_BY_PRICE_ID[priceId]
  if (!plan) {
    console.warn('[Stripe Webhook] Unknown price ID:', priceId)
    return
  }

  // ── Upsert dans Supabase avec service_role ────────────────────────
  // On crée un client service_role pour bypass RLS
  const supabaseAdmin = createSupabaseAdmin()

  // D'abord, vérifier si le plan existe en DB
  const { data: planRow, error: planError } = await supabaseAdmin
    .from('plans')
    .select('id')
    .eq('stripe_price_id', priceId)
    .single()

  if (planError || !planRow) {
    console.error('[Stripe Webhook] Plan not found in DB:', priceId)
    return
  }

  // Upsert user_subscription
  const { error: upsertError } = await supabaseAdmin
    .from('user_subscriptions')
    .upsert(
      {
        user_id: userId,
        plan_id: planRow.id,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        stripe_session_id: session.id,
        quota_used: 0,
        quota_renewed_at: new Date().toISOString(),
        subscription_status: 'active',
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
        // Mise à jour complète en cas de réabonnement
        ignoreDuplicates: false,
      }
    )

  if (upsertError) {
    console.error('[Stripe Webhook] Failed to upsert subscription:', upsertError)
    throw upsertError
  }

  console.log(
    `[Stripe Webhook] Subscription linked: user=${userId}, plan=${plan.name}`
  )
}

/**
 * customer.subscription.updated
 *
 * Met à jour le statut de l'abonnement si changement de plan ou de statut.
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id

  if (!customerId) return

  const priceId = subscription.items.data[0]?.price?.id
  if (!priceId) return

  const plan = PLAN_BY_PRICE_ID[priceId]
  const planId = plan
    ? (await getPlanIdByStripePriceId(priceId)) ?? undefined
    : undefined

  const statusMap: Record<string, string> = {
    active: 'active',
    trialing: 'active',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'unpaid',
    incomplete: 'incomplete',
  }

  const newStatus = statusMap[subscription.status] ?? 'inactive'

  const supabaseAdmin = createSupabaseAdmin()
  const { error } = await supabaseAdmin
    .from('user_subscriptions')
    .update({
      stripe_subscription_id: subscription.id,
      ...(planId && { plan_id: planId }),
      subscription_status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId)

  if (error) {
    console.error('[Stripe Webhook] Failed to update subscription:', error)
    throw error
  }
}

/**
 * customer.subscription.deleted
 *
 * Désactive l'abonnement quand il est définitivement annulé.
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id

  if (!customerId) return

  const supabaseAdmin = createSupabaseAdmin()
  const { error } = await supabaseAdmin
    .from('user_subscriptions')
    .update({
      subscription_status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('[Stripe Webhook] Failed to cancel subscription:', error)
    throw error
  }
}

/**
 * Crée un client Supabase avec le service_role key.
 * CE client bypass TOUTE la Row Level Security — usage EXCLUSIF serveur.
 */
function createSupabaseAdmin() {
  const { createClient } = require('@supabase/supabase-js')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
    )
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Retourne le plan_id UUID depuis la DB via stripe_price_id.
 * Cache le résultat en mémoire pour éviter des appels DB répétés.
 */
const planIdCache = new Map<string, string>()

async function getPlanIdByStripePriceId(stripePriceId: string): Promise<string | null> {
  if (planIdCache.has(stripePriceId)) {
    return planIdCache.get(stripePriceId) ?? null
  }

  const supabaseAdmin = createSupabaseAdmin()
  const { data, error } = await supabaseAdmin
    .from('plans')
    .select('id')
    .eq('stripe_price_id', stripePriceId)
    .single()

  if (error || !data) {
    return null
  }

  planIdCache.set(stripePriceId, data.id)
  return data.id
}
