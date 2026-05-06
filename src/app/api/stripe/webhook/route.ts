import { NextRequest, NextResponse } from 'next/server'
import { getStripe, getPlanByPriceId } from '@/lib/stripe/config'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

function getServiceSupabase() {
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

async function resolveUserIdFromCustomer(supabase: ReturnType<typeof getServiceSupabase>, customerId: string): Promise<string | null> {
  const { data } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle()
  return data?.user_id ?? null
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'missing signature' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'webhook secret not configured' }, { status: 500 })
  }

  let event: ReturnType<ReturnType<typeof getStripe>['webhooks']['constructEvent']>
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 })
  }

  const supabase = getServiceSupabase()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as {
        id: string
        customer: string
        customer_email: string | null
        subscription: string
        metadata: { plan?: string; flow?: string } | null
      }
      const customerId = session.customer as string
      const planSlug = session.metadata?.plan ?? null
      const flow = session.metadata?.flow ?? 'guest'

      // Retrouver le plan depuis le price_id de la subscription si pas en metadata
      let plan = planSlug
      if (!plan) {
        try {
          const stripe = getStripe()
          const sub = await stripe.subscriptions.retrieve(session.subscription as string)
          const priceId = sub.items.data[0]?.price.id
          if (priceId) {
            const found = getPlanByPriceId(priceId)
            if (found) plan = found
          }
        } catch {
          // continue avec plan null
        }
      }

      // Stocker en staging dans pending_checkouts (sera migré par link_stripe_session_to_user)
      const { error: insertError } = await supabase.from('pending_checkouts').upsert({
        stripe_session_id: session.id,
        stripe_customer_id: customerId,
        stripe_subscription_id: session.subscription as string,
        customer_email: session.customer_email,
        plan: plan ?? 'unknown',
        subscription_status: 'active',
        linked_user_id: null,
        linked_at: null,
      }, {
        onConflict: 'stripe_session_id',
      })

      if (insertError) {
        console.error('[Webhook] checkout.session.completed insert error:', insertError)
      }

      // Si client_reference_id présent, upsert direct user_subscriptions
      const clientRefId = (event.data.object as { client_reference_id?: string }).client_reference_id
      if (clientRefId) {
        await supabase.rpc('apply_subscription_change', {
          p_user_id: clientRefId,
          p_stripe_customer_id: customerId,
          p_stripe_subscription_id: session.subscription as string,
          p_stripe_session_id: session.id,
          p_plan: plan ?? 'unknown',
          p_subscription_status: 'active',
          p_current_period_start: null,
          p_current_period_end: null,
          p_customer_email: session.customer_email ?? '',
          p_units_limit: 0,
          p_reset_units: true,
        })
      }

      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as unknown as {
        id: string
        customer: string
        status: string
        current_period_start: number | null
        current_period_end: number | null
        items: { data: Array<{ price: { id: string } }> }
        metadata: { plan?: string } | null
      }

      const customerId = subscription.customer as string
      const userId = await resolveUserIdFromCustomer(supabase, customerId)
      if (!userId) {
        console.warn(`[Webhook] customer.subscription.updated: no user for customer ${customerId}`)
        break
      }

      let planSlug = subscription.metadata?.plan ?? null
      if (!planSlug) {
        const priceId = subscription.items.data[0]?.price.id
        if (priceId) {
          const found = getPlanByPriceId(priceId)
          if (found) planSlug = found
        }
      }

      const periodStart = subscription.current_period_start != null
        ? new Date(subscription.current_period_start * 1000).toISOString()
        : null
      const periodEnd = subscription.current_period_end != null
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null

      await supabase.rpc('apply_subscription_change', {
        p_user_id: userId,
        p_stripe_customer_id: customerId,
        p_stripe_subscription_id: subscription.id,
        p_stripe_session_id: '',
        p_plan: planSlug ?? 'unknown',
        p_subscription_status: subscription.status,
        p_current_period_start: periodStart ?? '',
        p_current_period_end: periodEnd ?? '',
        p_customer_email: '',
        p_units_limit: 0,
        p_reset_units: subscription.status === 'active',
      })

      break
    }

    case 'invoice.paid': {
      const invoice = event.data.object as { customer: string; billing_reason: string | null }
      const customerId = invoice.customer as string
      const userId = await resolveUserIdFromCustomer(supabase, customerId)
      if (!userId) break

      // Reset units_used sur renouvellement (billing_reason === 'subscription_cycle')
      if (invoice.billing_reason === 'subscription_cycle') {
        await supabase
          .from('user_subscriptions')
          .update({ units_used: 0, updated_at: new Date().toISOString() })
          .eq('user_id', userId)
      }

      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as { id: string; customer: string }
      const customerId = subscription.customer as string
      const userId = await resolveUserIdFromCustomer(supabase, customerId)
      if (!userId) break

      await supabase
        .from('user_subscriptions')
        .update({
          subscription_status: 'canceled',
          stripe_subscription_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      break
    }

    default:
      break
  }

  return NextResponse.json({ received: true })
}
