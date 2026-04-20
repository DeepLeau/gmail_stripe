import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe/config'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

type StripePlanId = 'start' | 'scale' | 'team'

// Type étendu pour les champs de période qui peuvent ne pas exister sur toutes les versions
type StripeSubscriptionWithPeriod = Stripe.Subscription & {
  current_period_start: number | null
  current_period_end: number | null
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const stripe = getStripe()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Supabase service role client pour le webhook
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabase = createServerClient(supabaseUrl, supabaseServiceKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll() {
        // Webhook n'a pas besoin de set des cookies
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    auth: { persistSession: false, autoRefreshToken: false },
  }) as any

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Flow B : le signup est déjà fait (via le signup/[plan] + redirect)
        // On récupère le pending_user_id via lookup par email dans metadata
        const email = session.metadata?.email
        const plan = session.metadata?.plan as StripePlanId | undefined

        if (!email || !plan) {
          console.error('[Webhook] Missing email or plan in session metadata')
          break
        }

        // Vérifier que le payment est bien fait
        if (session.payment_status !== 'paid') {
          console.log('[Webhook] Session not paid yet, skipping')
          break
        }

        // Retrouver l'utilisateur via son email
        const { data: user } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email.toLowerCase())
          .maybeSingle()

        if (!user) {
          console.error(`[Webhook] No user found for email ${email}`)
          break
        }

        const messagesLimit = plan === 'start' ? 10 : plan === 'scale' ? 50 : 100

        // Créer ou mettre à jour l'abonnement
        const { error: subError } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: user.id,
            plan: plan,
            status: 'active',
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string | null,
            stripe_price_id: session.metadata?.stripe_price_id ?? null,
            messages_limit: messagesLimit,
            current_period_start: session.created
              ? new Date(session.created * 1000).toISOString()
              : new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          }, { onConflict: 'user_id' })

        if (subError) {
          console.error('[Webhook] Failed to upsert subscription:', subError)
          break
        }

        // Insérer le quota messages (messages_used = 0 pour le nouveau mois)
        const { error: msgError } = await supabase
          .from('user_messages')
          .upsert({
            user_id: user.id,
            messages_used: 0,
            messages_limit: messagesLimit,
            period_start: new Date().toISOString(),
          }, { onConflict: 'user_id' })

        if (msgError) {
          console.error('[Webhook] Failed to upsert user_messages:', msgError)
        }

        console.log(`[Webhook] Activated subscription for user ${user.id}, plan ${plan}`)
        break
      }

      case 'checkout.session.expired': {
        // Log uniquement — le compte pending expire de lui-même
        const session = event.data.object as Stripe.Checkout.Session
        console.log(`[Webhook] Session expired: ${session.id}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as StripeSubscriptionWithPeriod

        // Retrouver le user via stripe_customer_id
        const { data: sub } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .maybeSingle()

        if (!sub) {
          console.error(`[Webhook] No subscription found for Stripe sub ${subscription.id}`)
          break
        }

        await supabase
          .from('user_subscriptions')
          .update({ status: 'canceled' })
          .eq('user_id', sub.user_id)

        console.log(`[Webhook] Canceled subscription for user ${sub.user_id}`)
        break
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    console.error('[Webhook] Error processing event:', err)
  }

  return NextResponse.json({ received: true })
}
