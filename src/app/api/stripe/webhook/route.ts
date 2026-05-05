/**
 * src/app/api/stripe/webhook/route.ts
 *
 * Webhook Stripe — flow GUEST.
 * Template: guest-subscription-quota
 *
 * NE PAS MODIFIER CE FICHIER MANUELLEMENT.
 *
 * Stratégie de routage par event :
 * - checkout.session.completed : on ne sait pas encore si l'user existe
 *   → on tente de retrouver via stripe_customer_id, sinon on stocke en pending_checkouts
 * - customer.subscription.updated : pour les renouvellements (l'user existe forcément)
 * - customer.subscription.deleted : annulation
 */
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { getStripe, getPlanLimit, getPlanByPriceId, type StripePlanName } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'missing_signature' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[Stripe webhook] STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'webhook_secret_not_configured' }, { status: 500 })
  }

  const stripe = getStripe()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('[Stripe webhook] Invalid signature:', err)
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 })
  }

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

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = typeof session.customer === 'string' ? session.customer : null
        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : null
        const sessionId = session.id
        const customerEmail = session.customer_details?.email ?? session.customer_email ?? null
        const planMeta = session.metadata?.plan
        if (!customerId || !subscriptionId || !planMeta) {
          console.error(`[Stripe webhook] Incomplete checkout.session.completed (event ${event.id})`)
          break
        }

        // Retrieve la subscription pour récupérer la période
        const rawSub = await stripe.subscriptions.retrieve(subscriptionId)
        const subscription = rawSub as unknown as Stripe.Subscription & {
          current_period_start: number | null
          current_period_end: number | null
        }
        const priceId = subscription.items.data[0]?.price?.id
        const plan = priceId ? getPlanByPriceId(priceId) : (planMeta as StripePlanName)
        if (!plan) {
          console.error(`[Stripe webhook] Unknown plan from price_id ${priceId} or metadata ${planMeta}`)
          break
        }

        const periodStart = subscription.current_period_start != null
          ? new Date(subscription.current_period_start * 1000).toISOString()
          : null
        const periodEnd = subscription.current_period_end != null
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null

        // Tentative de lookup user via customer_id (cas où l'user a déjà signé)
        const { data: existing } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        const { error: rpcError } = await supabase.rpc('apply_subscription_change', {
          p_user_id: existing?.user_id ?? null,
          p_plan: plan,
          p_units_limit: getPlanLimit(plan),
          p_stripe_customer_id: customerId,
          p_stripe_subscription_id: subscriptionId,
          p_stripe_session_id: sessionId,
          p_subscription_status: subscription.status,
          p_current_period_start: periodStart,
          p_current_period_end: periodEnd,
          p_customer_email: customerEmail,
          p_reset_units: true,
        })
        if (rpcError) {
          console.error(`[Stripe webhook] apply_subscription_change failed:`, rpcError)
        }
        break
      }

      case 'customer.subscription.updated': {
        const rawSub = event.data.object
        const subscription = rawSub as unknown as Stripe.Subscription & {
          current_period_start: number | null
          current_period_end: number | null
        }
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : null
        if (!customerId) break

        // Lookup user via customer_id
        const { data: existing } = await supabase
          .from('user_subscriptions')
          .select('user_id, current_period_start')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        if (!existing?.user_id) {
          // Cas : abonnement update reçu avant que le user ait fini son signup.
          // On met à jour le staging seulement.
          const { data: pending } = await supabase
            .from('pending_checkouts')
            .select('stripe_session_id')
            .eq('stripe_customer_id', customerId)
            .is('linked_user_id', null)
            .maybeSingle()
          if (!pending) {
            console.error(`[Stripe webhook] subscription.updated for unknown customer ${customerId}`)
            break
          }
          // On met à jour le staging via UPDATE direct (pas de RPC pour ça)
          const periodStart = subscription.current_period_start != null
            ? new Date(subscription.current_period_start * 1000).toISOString()
            : null
          const periodEnd = subscription.current_period_end != null
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null
          await supabase
            .from('pending_checkouts')
            .update({
              subscription_status: subscription.status,
              current_period_start: periodStart,
              current_period_end: periodEnd,
            })
            .eq('stripe_customer_id', customerId)
            .is('linked_user_id', null)
          break
        }

        const priceId = subscription.items.data[0]?.price?.id
        const plan = priceId ? getPlanByPriceId(priceId) : null
        if (!plan) break

        const periodStart = subscription.current_period_start != null
          ? new Date(subscription.current_period_start * 1000).toISOString()
          : null
        const periodEnd = subscription.current_period_end != null
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null

        const isNewPeriod = periodStart !== null
          && existing.current_period_start !== periodStart

        const { error: rpcError } = await supabase.rpc('apply_subscription_change', {
          p_user_id: existing.user_id,
          p_plan: plan,
          p_units_limit: getPlanLimit(plan),
          p_stripe_customer_id: customerId,
          p_stripe_subscription_id: subscription.id,
          p_stripe_session_id: null, // pas applicable pour un update
          p_subscription_status: subscription.status,
          p_current_period_start: periodStart,
          p_current_period_end: periodEnd,
          p_customer_email: null,
          p_reset_units: isNewPeriod,
        })
        if (rpcError) {
          console.error(`[Stripe webhook] apply_subscription_change failed:`, rpcError)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : null
        if (!customerId) break

        const { data: existing } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        if (!existing?.user_id) break

        const { error: rpcError } = await supabase.rpc('apply_subscription_change', {
          p_user_id: existing.user_id,
          p_plan: null,
          p_units_limit: 0,
          p_stripe_customer_id: customerId,
          p_stripe_subscription_id: null,
          p_stripe_session_id: null,
          p_subscription_status: 'canceled',
          p_current_period_start: null,
          p_current_period_end: null,
          p_customer_email: null,
          p_reset_units: true,
        })
        if (rpcError) {
          console.error(`[Stripe webhook] apply_subscription_change failed on cancel:`, rpcError)
        }
        break
      }

      default:
        break
    }
  } catch (err) {
    console.error(`[Stripe webhook] Unhandled error on ${event.type}:`, err)
  }

  return NextResponse.json({ received: true })
}
