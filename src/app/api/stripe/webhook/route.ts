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
    return NextResponse.json({ error: 'webhook_secret_not_configured' }, { status: 500 })
  }

  const stripe = getStripe()
  let event: ReturnType<typeof stripe.webhooks.constructEvent>

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 })
  }

  // Service role client — bypasses RLS, needed for webhook writes
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

  // Checkout Session completed — guest flow: stripe collects email, stores in staging
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as {
      id: string
      customer: string | null
      customer_email: string | null
      metadata: Record<string, string>
      subscription?: string
    }

    const plan = session.metadata?.plan ?? null
    const userId = session.metadata?.user_id ?? null

    await supabase.from('pending_checkouts').upsert({
      stripe_session_id: session.id,
      stripe_customer_id: session.customer ?? null,
      customer_email: session.customer_email ?? null,
      plan,
      linked_user_id: userId,
    } as Record<string, unknown>)
  }

  // Subscription created/updated — active le quota côté user
  if (
    event.type === 'customer.subscription.created' ||
    event.type === 'customer.subscription.updated'
  ) {
    const sub = event.data.object as unknown as {
      id: string
      customer: string
      status: string
      metadata: Record<string, string>
      items: { data: Array<{ price: { id: string } }> }
      current_period_start: number | null
      current_period_end: number | null
    }

    const plan = sub.metadata?.plan ?? null
    const customerId = sub.customer

    // Resolve user_id from stripe_customer_id
    const { data: subRow } = await supabase
      .from('user_subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle()

    const userId = subRow?.user_id ?? null

    if (userId && plan) {
      await supabase.from('user_subscriptions').upsert(
        {
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: sub.id,
          plan,
          subscription_status: sub.status,
          current_period_start: sub.current_period_start
            ? new Date(sub.current_period_start * 1000).toISOString()
            : null,
          current_period_end: sub.current_period_end
            ? new Date(sub.current_period_end * 1000).toISOString()
            : null,
        } as Record<string, unknown>,
        { onConflict: 'user_id' }
      )
    }
  }

  // Subscription deleted — désactive le quota
  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as { id: string; customer: string }
    await supabase
      .from('user_subscriptions')
      .update({ subscription_status: 'canceled' } as Record<string, unknown>)
      .eq('stripe_subscription_id', sub.id)
  }

  return NextResponse.json({ received: true })
}
