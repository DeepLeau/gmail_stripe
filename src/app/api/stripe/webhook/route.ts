import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { getStripe, getPlanLimit, type StripePlanName } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'missing signature' }, { status: 400 })
  }

  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'webhook secret not configured' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('[Webhook] Invalid signature:', err)
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 })
  }

  // Service role client pour webhook — bypass RLS
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

  // ── Helpers de mapping price_id → plan name ──
  const priceToPlan: Record<string, StripePlanName> = {
    [process.env.STRIPE_START_PRICE_ID ?? '']: 'start',
    [process.env.STRIPE_SCALE_PRICE_ID ?? '']: 'scale',
    [process.env.STRIPE_TEAM_PRICE_ID ?? '']: 'team',
  }

  function resolvePlanFromPriceId(priceId: string): StripePlanName {
    return priceToPlan[priceId] ?? 'start'
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode !== 'subscription') {
          console.log(`[Webhook] Session ${session.id} is not a subscription mode, skipping`)
          return NextResponse.json({ received: true })
        }

        const stripeSessionId = session.id
        const stripeCustomerId = session.customer as string
        const stripeSubscriptionId = session.subscription as string
        const customerEmail = session.customer_details?.email ?? session.customer_email ?? null

        let planName: StripePlanName = 'start'
        let priceId = ''

        if (session.line_items?.data?.[0]?.price) {
          priceId = session.line_items.data[0].price.id
          planName = resolvePlanFromPriceId(priceId)
        }

        // Stockage en attente dans pending_stripe_links — pas de user_id (compte pas encore créé)
        const { error: insertError } = await supabase
          .from('pending_stripe_links')
          .upsert({
            stripe_session_id: stripeSessionId,
            stripe_customer_id: stripeCustomerId,
            stripe_subscription_id: stripeSubscriptionId,
            plan_name: planName,
            price_id: priceId,
            user_identifier: customerEmail,
            expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1h TTL
          }, {
            onConflict: 'stripe_session_id',
          })

        if (insertError) {
          console.error(`[Webhook] Failed to upsert pending_stripe_links for session ${stripeSessionId}:`, insertError)
        } else {
          console.log(`[Webhook] Stored pending link for session ${stripeSessionId}, customer ${stripeCustomerId}, plan ${planName}`)
        }

        return NextResponse.json({ received: true })
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription & {
          current_period_start: number | null
          current_period_end: number | null
        }

        const stripeCustomerId = subscription.customer as string
        const stripeSubscriptionId = subscription.id
        const status = subscription.status
        const cancelAtPeriodEnd = subscription.cancel_at_period_end

        // Conversion des timestamps Unix → ISO string
        const periodStart = subscription.current_period_start != null
          ? new Date(subscription.current_period_start * 1000).toISOString()
          : null
        const periodEnd = subscription.current_period_end != null
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null

        // Résolution du plan via price_id (pris du premier item)
        let planName: StripePlanName = 'start'
        let messagesLimit: number = getPlanLimit('start')

        const priceId = subscription.items.data[0]?.price?.id
        if (priceId) {
          planName = resolvePlanFromPriceId(priceId)
          messagesLimit = getPlanLimit(planName)
        }

        // Lookup user_id via customer_id AVANT upsert
        const { data: existingSub } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', stripeCustomerId)
          .maybeSingle()

        if (!existingSub?.user_id) {
          console.warn(`[Webhook] No user found for customer ${stripeCustomerId} — event ${event.id}. Subscription will be orphaned until manual link.`)
          return NextResponse.json({ received: true })
        }

        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: existingSub.user_id,
            stripe_customer_id: stripeCustomerId,
            stripe_subscription_id: stripeSubscriptionId,
            stripe_price_id: priceId,
            plan_name: planName,
            status,
            messages_limit: messagesLimit,
            current_period_start: periodStart,
            current_period_end: periodEnd,
            cancel_at_period_end: cancelAtPeriodEnd,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
          })

        if (updateError) {
          console.error(`[Webhook] Failed to update subscription for customer ${stripeCustomerId}:`, updateError)
        } else {
          console.log(`[Webhook] Updated subscription for customer ${stripeCustomerId}, status: ${status}`)
        }

        return NextResponse.json({ received: true })
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        const stripeCustomerId = subscription.customer as string

        // Lookup user_id via customer_id
        const { data: existingSub } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', stripeCustomerId)
          .maybeSingle()

        if (!existingSub?.user_id) {
          console.warn(`[Webhook] No user found for customer ${stripeCustomerId} on deletion — event ${event.id}`)
          return NextResponse.json({ received: true })
        }

        const { error: deleteError } = await supabase
          .from('user_subscriptions')
          .update({
            status: 'canceled',
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', existingSub.user_id)

        if (deleteError) {
          console.error(`[Webhook] Failed to cancel subscription for customer ${stripeCustomerId}:`, deleteError)
        } else {
          console.log(`[Webhook] Canceled subscription for customer ${stripeCustomerId}`)
        }

        return NextResponse.json({ received: true })
      }

      default:
        // Event non géré — 200 rapide (évite le timeout Stripe 30s)
        console.log(`[Webhook] Unhandled event type: ${event.type}`)
        return NextResponse.json({ received: true })
    }
  } catch (err) {
    // Erreur métier — on retourne 200 quand même, Stripe rejouera si needed
    console.error(`[Webhook] Error processing event ${event.id}:`, err)
    return NextResponse.json({ received: true })
  }
}
