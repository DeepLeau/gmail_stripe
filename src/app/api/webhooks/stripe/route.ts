import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// ── Supabase service-role client (bypass RLS for writes) ──────
async function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll() {
        // no-op for webhook — service_role doesn't need cookie sync
      },
    },
    auth: { persistSession: false, autoRefreshToken: false },
  }) as any
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe-Signature header' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await getSupabaseAdmin()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const planId = session.metadata?.plan_id ?? null
        const customerId = session.customer as string | null
        const subscriptionId = (session as Stripe.Checkout.Session & { subscription?: string }).subscription ?? null
        const customerEmail = session.customer_details?.email ?? null

        if (!customerId) break

        // upsert into pending_checkouts
        const { error } = await supabase
          .from('pending_checkouts')
          .upsert(
            {
              stripe_session_id: session.id,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId ?? null,
              plan: planId ?? 'unknown',
              customer_email: customerEmail ?? null,
              subscription_status: 'active',
            },
            {
              onConflict: 'stripe_session_id',
              ignoreDuplicates: true,
            }
          )
          .select()
          .single()

        if (error) {
          console.error('[Webhook] upsert pending_checkouts error:', error)
        }

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription & {
          current_period_start: number | null
          current_period_end: number | null
        }
        const customerId = subscription.customer as string
        const subId = subscription.id
        const status = subscription.status
        const planId = (subscription.metadata?.plan_id as string | undefined) ?? 'unknown'
        const periodStart = subscription.current_period_start
          ? new Date(subscription.current_period_start * 1000).toISOString()
          : null
        const periodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null

        // lookup user from user_subscriptions by stripe_customer_id
        const { data: subRow } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        if (!subRow?.user_id) {
          console.warn(`[Webhook] No user found for customer ${customerId}`)
          break
        }

        // map stripe status → our status
        const statusMap: Record<string, string> = {
          active: 'active',
          trialing: 'active',
          past_due: 'past_due',
          canceled: 'canceled',
          unpaid: 'canceled',
          incomplete: 'pending',
        }
        const mappedStatus = statusMap[status] ?? status

        // units_limit from plan
        const { getPlanLimit } = await import('@/lib/stripe')
        const unitsLimit = (() => {
          try {
            if (planId && planId !== 'unknown') {
              return getPlanLimit(planId as 'starter' | 'growth' | 'pro')
            }
          } catch { /* ignore */ }
          return 0
        })()

        const { error: rpcError } = await supabase.rpc('apply_subscription_change', {
          p_user_id: subRow.user_id,
          p_stripe_customer_id: customerId,
          p_stripe_subscription_id: subId,
          p_plan: planId,
          p_subscription_status: mappedStatus,
          p_current_period_start: periodStart ?? '',
          p_current_period_end: periodEnd ?? '',
          p_units_limit: unitsLimit,
          p_stripe_session_id: '',
          p_customer_email: '',
          p_reset_units: true,
        })

        if (rpcError) {
          console.error('[Webhook] apply_subscription_change error:', rpcError)
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: subRow } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        if (!subRow?.user_id) break

        const { error: rpcError } = await supabase.rpc('apply_subscription_change', {
          p_user_id: subRow.user_id,
          p_stripe_customer_id: customerId,
          p_stripe_subscription_id: subscription.id,
          p_plan: 'free',
          p_subscription_status: 'canceled',
          p_current_period_start: '',
          p_current_period_end: '',
          p_units_limit: 0,
          p_stripe_session_id: '',
          p_customer_email: '',
          p_reset_units: true,
        })

        if (rpcError) {
          console.error('[Webhook] subscription deleted error:', rpcError)
        }

        break
      }

      default:
        // unhandled event type — acknowledge silently
        break
    }
  } catch (err) {
    console.error('[Webhook] Handler error:', err)
    // Return 200 so Stripe doesn't retry for application errors
    // (signature is valid, we just failed processing)
  }

  return NextResponse.json({ received: true })
}
