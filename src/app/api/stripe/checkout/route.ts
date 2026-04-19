import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe/client'
import { isValidPlanName, PLAN_BY_NAME } from '@/lib/stripe/config'
import { createClient as createSupabaseServer } from '@/lib/supabase/server'

/**
 * POST /api/stripe/checkout
 *
 * Crée une Stripe Checkout Session en mode subscription.
 * Redirige l'utilisateur vers Stripe pour payer.
 *
 * Body : { planId: 'start' | 'scale' | 'team' }
 * Response 200 : { url: string } — URL de redirection Stripe Checkout
 * Response 400 : { error: 'Invalid plan' }
 * Response 401 : { error: 'Not authenticated' }
 * Response 500 : { error: string } — erreur Stripe
 */
export async function POST(request: NextRequest) {
  // ── Authentification ──────────────────────────────────────────────
  const supabase = await createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // ── Parsing du body ────────────────────────────────────────────────
  let body: { planId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { planId } = body

  if (!planId || typeof planId !== 'string') {
    return NextResponse.json({ error: 'planId is required' }, { status: 400 })
  }

  // ── Validation du plan ────────────────────────────────────────────
  if (!isValidPlanName(planId)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const plan = PLAN_BY_NAME[planId]

  // ── Vérifier que le price Stripe existe ───────────────────────────
  const stripe = getStripe()
  let priceExists = false
  try {
    await stripe.prices.retrieve(plan.stripePriceId)
    priceExists = true
  } catch {
    console.warn(
      `[Stripe Checkout] Price not found in Stripe: ${plan.stripePriceId}. ` +
        'Create it in Stripe Dashboard first.'
    )
    priceExists = false
  }

  // ── Construire les URLs de redirection ────────────────────────────
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const successUrl = `${baseUrl}/signup?session_id={CHECKOUT_SESSION_ID}`
  const cancelUrl = `${baseUrl}/#pricing`

  // ── Créer la Checkout Session ──────────────────────────────────────
  try {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: user.id,
        planName: plan.name,
      },
      automatic_tax: { enabled: false },
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    if (!session.url) {
      throw new Error('Stripe returned a session without a URL')
    }

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Stripe checkout error'
    console.error('[Stripe Checkout] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
