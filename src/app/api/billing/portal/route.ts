import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: 'Configuration indisponible' },
      { status: 503 }
    )
  }

  try {
    const { getStripe } = await import('@/lib/stripe/config')
    const stripe = getStripe()

    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Aucun abonnement actif trouvé' },
        { status: 404 }
      )
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${baseUrl}/chat`,
    })

    return NextResponse.redirect(session.url, 302)
  } catch (err) {
    console.error('[Portal] Error:', err)
    return NextResponse.json(
      { error: 'Erreur lors de la création du portail' },
      { status: 500 }
    )
  }
}
