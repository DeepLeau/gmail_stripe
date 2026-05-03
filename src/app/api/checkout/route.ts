/**
 * POST /api/checkout
 *
 * Crée une Stripe Checkout Session en mode subscription pour le plan choisi.
 * Flow anonyme : pas de session utilisateur requise.
 * L'utilisateur est redirigé vers /signup?session_id={CHECKOUT_SESSION_ID} après paiement.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getStripe, getPlanFromSlug, getPriceId } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

export async function POST(request: NextRequest) {
  // ── 1. Lecture et validation du body ──────────────────────────────────────

  let body: { plan?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const planSlug = typeof body.plan === 'string' ? body.plan : null
  const plan = getPlanFromSlug(planSlug)

  if (!plan) {
    return NextResponse.json(
      { error: `Plan '${planSlug}' is not valid. Use 'starter', 'growth' or 'pro'.` },
      { status: 400 }
    )
  }

  // ── 2. Récupération du price_id Stripe ───────────────────────────────────

  let priceId: string
  try {
    priceId = getPriceId(plan.slug)
  } catch (err) {
    console.error('[checkout] Missing Stripe price ID:', (err as Error).message)
    return NextResponse.json(
      { error: 'Stripe price ID not configured. Please contact support.' },
      { status: 500 }
    )
  }

  // ── 3. Création de la Checkout Session ───────────────────────────────────

  try {
    const stripe = getStripe()

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // Redirection après succès → page signup avec session_id
      success_url: `${BASE_URL}/signup?session_id={CHECKOUT_SESSION_ID}`,
      // Redirection après annulation → section pricing
      cancel_url: `${BASE_URL}/#pricing`,
      // Métadonnées pour le webhook
      metadata: {
        plan: plan.slug,
      },
      // Pas de client_reference_id (flow anonyme, pas de user_id encore)
      // La liaison se fait via la RPC link_stripe_session_to_user() après signup
      subscription_data: {
        metadata: {
          plan: plan.slug,
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const stripeError = err as { message?: string }
    console.error('[checkout] Stripe error:', stripeError.message)
    return NextResponse.json(
      { error: 'Failed to create checkout session. Please try again.' },
      { status: 500 }
    )
  }
}
