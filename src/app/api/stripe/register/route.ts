import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Appelé par le SignupForm après signUp — crée user_billing avec le plan Stripe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { stripeSessionId, stripeCustomerId, stripeSubscriptionId, plan, messagesLimit } =
      body as {
        stripeSessionId: string
        stripeCustomerId: string | null
        stripeSubscriptionId: string | null
        plan: string
        messagesLimit: number
      }

    if (!stripeSessionId) {
      return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
    }

    // Marquer la session comme confirmée
    await (supabase as any)
      .from('stripe_sessions')
      .update({ confirmed: true })
      .eq('stripe_session_id', stripeSessionId)

    // Créer ou mettre à jour le billing
    const { error: billingError } = await (supabase as any)
      .from('user_billing')
      .upsert({
        user_id: user.id,
        plan,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        subscription_status: 'active',
        messages_limit: messagesLimit,
        messages_used: 0,
      }, {
        onConflict: 'user_id',
      })

    if (billingError) {
      console.error('[Stripe] register billing error:', billingError)
      return NextResponse.json({ error: 'server_error' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[Stripe] register error:', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
