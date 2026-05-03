/**
 * src/app/api/stripe/webhook/route.ts
 *
 * Webhook Stripe — reçoit checkout.session.completed, insère dans pending_checkouts.
 * Utilise SUPABASE_SERVICE_ROLE_KEY (bypass RLS) avec cast `as any` pour éviter les `never`
 * sur les writes (skill stripe.md §5.2, §6).
 */
import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/config'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'missing_signature' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'webhook_secret_not_configured' }, { status: 500 })
  }

  const stripe = getStripe()
  let event: ReturnType<typeof stripe.webhooks.constructEvent>

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 })
  }

  // Service role client — bypass RLS pour les writes sur pending_checkouts
  // cast `as any` requis pour éviter les `never` sur les INSERT/UPDATE (skill §5.2)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {
          // Read-only dans le webhook — pas de cookies à écrire
        },
        remove() {
          // No-op
        },
      },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  ) as any

  // ── checkout.session.completed — flow guest ────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as import('stripe').Stripe.Checkout.Session & {
      metadata?: Record<string, string>
      customer_email?: string | null
      customer?: string
      subscription?: string
    }

    const stripeSessionId = session.id
    const stripeCustomerId = typeof session.customer === 'string' ? session.customer : null
    const stripeSubscriptionId =
      typeof session.subscription === 'string' ? session.subscription : null
    const customerEmail =
      session.customer_email ??
      (session.metadata?.customer_email as string | undefined) ??
      null
    const plan = session.metadata?.plan ?? 'starter'

    // Récupère les infos de période depuis la subscription si présente
    let currentPeriodStart: string | null = null
    let currentPeriodEnd: string | null = null
    let subscriptionStatus = 'active'

    if (stripeSubscriptionId) {
      try {
        const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId)
        const typedSub = sub as unknown as import('stripe').Stripe.Subscription & {
          current_period_start: number | null
          current_period_end: number | null
        }
        if (typedSub.current_period_start != null) {
          currentPeriodStart = new Date(typedSub.current_period_start * 1000).toISOString()
        }
        if (typedSub.current_period_end != null) {
          currentPeriodEnd = new Date(typedSub.current_period_end * 1000).toISOString()
        }
        subscriptionStatus = sub.status
      } catch (subErr) {
        console.warn('[Webhook] Could not retrieve subscription:', subErr)
      }
    }

    // INSERT dans pending_checkouts — upsert sur stripe_session_id (idempotent)
    const { error: upsertError } = await supabase
      .from('pending_checkouts')
      .upsert(
        {
          stripe_session_id: stripeSessionId,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: stripeSubscriptionId,
          plan,
          customer_email: customerEmail,
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd,
          subscription_status: subscriptionStatus,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'stripe_session_id' }
      )

    if (upsertError) {
      console.error('[Webhook] Failed to upsert pending_checkout:', upsertError)
      return NextResponse.json({ error: 'db_write_failed' }, { status: 500 })
    }

    console.log(
      `[Webhook] checkout.session.completed — session=${stripeSessionId} plan=${plan}`
    )
  }

  // ── customer.subscription.updated — sync statut ─────────────────────────────
  if (
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.deleted'
  ) {
    const subscription = event.data.object as import('stripe').Stripe.Subscription & {
      current_period_start: number | null
      current_period_end: number | null
    }

    const stripeCustomerId = typeof subscription.customer === 'string'
      ? subscription.customer
      : null
    const stripeSubscriptionId = subscription.id
    const periodStart = subscription.current_period_start != null
      ? new Date(subscription.current_period_start * 1000).toISOString()
      : null
    const periodEnd = subscription.current_period_end != null
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null

    // Met à jour pending_checkouts avec le nouveau statut
    if (stripeCustomerId) {
      await supabase
        .from('pending_checkouts')
        .update({
          subscription_status: subscription.status,
          current_period_start: periodStart,
          current_period_end: periodEnd,
          stripe_subscription_id: stripeSubscriptionId,
        })
        .eq('stripe_customer_id', stripeCustomerId)
        .eq('stripe_subscription_id', stripeSubscriptionId)
    }

    // Met à jour user_subscriptions (via la RPC apply_subscription_change si exists)
    if (stripeCustomerId) {
      const { data: subRow } = await supabase
        .from('user_subscriptions')
        .select('user_id')
        .eq('stripe_customer_id', stripeCustomerId)
        .maybeSingle()

      if (subRow?.user_id) {
        // Utilise la RPC existante pour mettre à jour proprement
        const planFromSub = subscription.metadata?.plan ?? 'starter'
        await supabase.rpc('apply_subscription_change', {
          p_user_id: subRow.user_id,
          p_stripe_customer_id: stripeCustomerId,
          p_stripe_subscription_id: stripeSubscriptionId,
          p_plan: planFromSub,
          p_subscription_status: subscription.status,
          p_current_period_start: periodStart ?? '',
          p_current_period_end: periodEnd ?? '',
          p_customer_email: '',
          p_stripe_session_id: '',
          p_units_limit:
            planFromSub === 'starter' ? 50 : planFromSub === 'growth' ? 200 : 1000,
          p_reset_units: false,
        })
      }
    }
  }

  return NextResponse.json({ received: true })
}
