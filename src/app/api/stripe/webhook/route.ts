import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getStripe, getPlanLimit, isValidPlan } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'missing signature' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'webhook secret not configured' }, { status: 500 })
  }

  const stripe = getStripe()
  let event: ReturnType<typeof stripe.webhooks.constructEvent>

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('[Webhook] Invalid signature:', err)
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 })
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
        const session = event.data.object

        const customerId = session.customer as string
        const sessionId = session.id
        const subscriptionId = session.subscription as string | null
        const planId = (session.metadata as Record<string, string> | undefined)?.plan_id

        if (!planId || !isValidPlan(planId)) {
          console.error(`[Webhook] Invalid plan in metadata: ${planId}`)
          break
        }

        const { data: existingSub } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        if (!existingSub?.user_id) {
          console.error(`[Webhook] No user found for customer ${customerId}`)
          break
        }

        const messagesLimit = getPlanLimit(planId)

        let periodStart: string | null = null
        let periodEnd: string | null = null

        if (subscriptionId) {
          try {
            const subscriptionObject = await stripe.subscriptions.retrieve(subscriptionId)
            const subData = subscriptionObject as unknown as {
              current_period_start: number | null
              current_period_end: number | null
            }
            if (subData.current_period_start) {
              periodStart = new Date(subData.current_period_start * 1000).toISOString()
            }
            if (subData.current_period_end) {
              periodEnd = new Date(subData.current_period_end * 1000).toISOString()
            }
          } catch (err) {
            console.error(`[Webhook] Failed to retrieve subscription ${subscriptionId}:`, err)
          }
        }

        await supabase.rpc('apply_subscription_change', {
          p_stripe_customer_id: customerId,
          p_stripe_subscription_id: subscriptionId,
          p_stripe_session_id: sessionId,
          p_plan: planId,
          p_messages_limit: messagesLimit,
          p_status: 'active',
          p_period_start: periodStart,
          p_period_end: periodEnd,
        })

        console.log(`[Webhook] checkout.session.completed processed for session ${sessionId}`)
        break
      }

      case 'customer.subscription.updated': {
        const subscriptionObject = event.data.object
        const subData = subscriptionObject as unknown as {
          current_period_start: number | null
          current_period_end: number | null
          customer: string
          id: string
          status: string
          items: { data: Array<{ price: { metadata?: Record<string, string> } }> }
        }

        const customerId = subData.customer
        const subscriptionId = subData.id

        const { data: existingSub } = await supabase
          .from('user_subscriptions')
          .select('user_id, current_period_start')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        if (!existingSub?.user_id) {
          console.error(`[Webhook] No user found for customer ${customerId}`)
          break
        }

        if (subData.current_period_start) {
          const newPeriodStart = new Date(subData.current_period_start * 1000).toISOString()
          await supabase.rpc('reset_messages_on_renewal', {
            p_stripe_subscription_id: subscriptionId,
            p_new_period_start: newPeriodStart,
          })
        }

        const planId = subData.items?.data[0]?.price?.metadata?.plan
        const validPlanId = planId && isValidPlan(planId) ? planId : null

        if (validPlanId) {
          const periodStart = subData.current_period_start != null
            ? new Date(subData.current_period_start * 1000).toISOString()
            : null
          const periodEnd = subData.current_period_end != null
            ? new Date(subData.current_period_end * 1000).toISOString()
            : null

          await supabase.rpc('apply_subscription_change', {
            p_stripe_customer_id: customerId,
            p_stripe_subscription_id: subscriptionId,
            p_stripe_session_id: null,
            p_plan: validPlanId,
            p_messages_limit: getPlanLimit(validPlanId),
            p_status: subData.status,
            p_period_start: periodStart,
            p_period_end: periodEnd,
          })
        } else {
          await supabase
            .from('user_subscriptions')
            .update({
              subscription_status: subData.status,
              current_period_end: subData.current_period_end
                ? new Date(subData.current_period_end * 1000).toISOString()
                : null,
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_customer_id', customerId)
        }

        console.log(`[Webhook] customer.subscription.updated processed for subscription ${subscriptionId}`)
        break
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    console.error(`[Webhook] Error processing event ${event.id}:`, err)
  }

  return NextResponse.json({ received: true })
}
