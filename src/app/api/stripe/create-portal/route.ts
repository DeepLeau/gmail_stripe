import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/config'
import { createClient } from '@/lib/supabase/server'

export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Récupérer le customer_id Stripe
    const { data: sub } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()

    if (!sub?.stripe_customer_id) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 404 })
    }

    const stripe = getStripe()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${appUrl}/chat`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
