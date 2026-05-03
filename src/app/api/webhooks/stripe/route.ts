/**
 * POST /api/webhooks/stripe
 *
 * Handler webhook Stripe avec vérification de signature.
 *
 * LATENT_ISSUE CURRENT_PERIOD_NULL : à la première réception du webhook
 * checkout.session.completed, les champs current_period_start/end sont null
 * dans pending_checkouts (les données viennent de Stripe avant la subscription).
 * On récupère les périodes via stripe.subscriptions.retrieve() pour les populate.
 *
 * LATENT_ISSUE pending_checkouts RLS : cette table a RLS activée mais aucune policy.
 * Elle ne doit JAMAIS être exposée côté client — toutes les lectures/écritures
 * passent par ce webhook handler (service_role uniquement).
 */

import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

/**
 * Crée un client Supabase avec le service_role pour les écritures webhook.
 * On cast en `as any` à la création du client pour éviter les erreurs `never`
 * sur les INSERT/UPDATE/UPSERT (le type Database n'est pas chargé ici, la cohérence
 * est assurée par le schéma de la migration qui a créé les tables).
 * Le cast `as any` est acceptable ici car le webhook a déjà vérifié la signature
 * Stripe et le service_role bypass RLS.
 */
async function createServiceRoleClient(): Promise<any> {
  const { createServerClient } = await import('@supabase/ssr')
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  const client = createServerClient(supabaseUrl, supabaseServiceKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll() {
        // Webhook handler — on ne écrit pas de cookies ici
      },
    },
  }) as any

  return client
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getSubscriptionPeriods(
  stripe: Stripe,
  subscriptionId: string
): Promise<{ periodStart: string | null; periodEnd: string | null }> {
  try {
    // Cast via unknown pour accéder aux champs du wrapper Response<Subscription>
    const raw = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['items.data.price.recurring'],
    })
    const sub = raw as unknown as {
      current_period_start: number | null
      current_period_end: number | null
    }
    return {
      periodStart:
        sub.current_period_start != null
          ? new Date(sub.current_period_start * 1000).toISOString()
          : null,
      periodEnd:
        sub.current_period_end != null
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null,
    }
  } catch (err) {
    console.warn(
      `[webhook] Could not retrieve subscription periods for ${subscriptionId}:`,
      (err as Error).message
    )
    return { periodStart: null, periodEnd: null }
  }
}

// ── Handler principal ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // ── 1. Lecture du body raw et vérification de signature ─────────────────────

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('[webhook] Signature verification failed:', (err as Error).message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // ── 2. Dispatch par type d'event ──────────────────────────────────────────

  const supabase = await createServiceRoleClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as {
          id: string
          customer: string | null
          customer_email: string | null
          subscription: string | null
          metadata: Record<string, string>
          payment_status: string
        }

        // Skip si le paiement n'a pas été réussi
        if (session.payment_status !== 'paid') {
          console.log('[webhook] checkout.session.completed — not paid, skipping')
          break
        }

        const planSlug = session.metadata?.plan ?? null
        if (!planSlug) {
          console.warn('[webhook] checkout.session.completed — no plan in metadata, skipping')
          break
        }

        // Vérifier s'il y a déjà un user lié (signup déjà fait avant le webhook)
        // En cherchant par stripe_customer_id
        const { data: existingSub } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', session.customer)
          .maybeSingle()

        if (existingSub?.user_id) {
          // Un user existe déjà → appliquer le changement directement via RPC
          // current_period_start/end sont null dans les données brutes de Stripe Checkout
          // → on les récupère via subscriptions.retrieve()
          const { periodStart, periodEnd } = await getSubscriptionPeriods(
            getStripe(),
            session.subscription ?? ''
          )

          await supabase.rpc('apply_subscription_change', {
            p_user_id: existingSub.user_id,
            p_stripe_customer_id: session.customer ?? '',
            p_stripe_subscription_id: session.subscription ?? '',
            p_stripe_session_id: session.id,
            p_customer_email: session.customer_email ?? '',
            p_plan: planSlug,
            p_subscription_status: 'active',
            p_units_limit: planSlug === 'starter' ? 50 : planSlug === 'growth' ? 200 : 1000,
            p_current_period_start: periodStart ?? '',
            p_current_period_end: periodEnd ?? '',
            p_reset_units: true,
          })
          console.log(
            `[webhook] checkout.session.completed — applied to existing user ${existingSub.user_id}`
          )
        } else {
          // Pas de user lié → stocker dans pending_checkouts pour linkage ultérieur
          // (le visitor n'a pas encore créé son compte sur /signup)
          const { periodStart, periodEnd } = await getSubscriptionPeriods(
            getStripe(),
            session.subscription ?? ''
          )

          await supabase.from('pending_checkouts').upsert({
            stripe_session_id: session.id,
            stripe_customer_id: session.customer ?? '',
            stripe_subscription_id: session.subscription ?? '',
            plan: planSlug,
            customer_email: session.customer_email ?? null,
            subscription_status: 'active',
            current_period_start: periodStart,
            current_period_end: periodEnd,
            linked_user_id: null,
            linked_at: null,
          })
          console.log(
            `[webhook] checkout.session.completed — stored in pending_checkouts (session ${session.id})`
          )
        }
        break
      }

      case 'customer.subscription.updated': {
        // Cast via unknown pour extraire les champs période du wrapper Response<Subscription>
        const rawSub = event.data.object as unknown as {
          id: string
          customer: string
          status: string
          current_period_start: number | null
          current_period_end: number | null
        }

        const { periodStart, periodEnd } = await getSubscriptionPeriods(
          getStripe(),
          rawSub.id
        )

        // Mise à jour des champs période et statut
        const { error } = await supabase
          .from('user_subscriptions')
          .update({
            subscription_status: rawSub.status,
            current_period_start: periodStart,
            current_period_end: periodEnd,
          })
          .eq('stripe_customer_id', rawSub.customer)

        if (error) {
          console.error(
            `[webhook] customer.subscription.updated — update failed:`,
            error.message
          )
        } else {
          console.log(
            `[webhook] customer.subscription.updated — updated ${rawSub.id} (status: ${rawSub.status})`
          )
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as { customer: string; id: string }

        const { error } = await supabase
          .from('user_subscriptions')
          .update({ subscription_status: 'canceled' })
          .eq('stripe_customer_id', subscription.customer)

        if (error) {
          console.error(
            `[webhook] customer.subscription.deleted — update failed:`,
            error.message
          )
        } else {
          console.log(
            `[webhook] customer.subscription.deleted — canceled ${subscription.id}`
          )
        }
        break
      }

      default:
        console.log(`[webhook] Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    console.error('[webhook] Handler error:', err)
    // Retourne 200 pour éviter le retry infini de Stripe sur une erreur applicative
    // Le handler doit être idempotent et ne pas throw
  }

  return NextResponse.json({ received: true })
}
