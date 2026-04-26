import { NextRequest, NextResponse } from 'next/server'
import { getStripe, getPlanByPriceId } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

/**
 * Route appelée par /signup après un signup réussi avec session_id Stripe.
 * Récupère le plan depuis la Checkout Session et le retourne au client.
 *
 * POST /api/stripe/account-link
 * Body: { sessionId: string }
 */
export async function POST(request: NextRequest) {
  let sessionId: string | null = null

  try {
    const body = await request.json()
    sessionId = body.sessionId ?? null
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  if (!sessionId) {
    return NextResponse.json({ error: 'session_id_required' }, { status: 400 })
  }

  const stripe = getStripe()

  let session: import('stripe').Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId)
  } catch (err) {
    console.error('[Stripe account-link] Failed to retrieve session:', err)
    return NextResponse.json({ error: 'session_not_found' }, { status: 404 })
  }

  // Récupère le plan via price_id (priorité) ou metadata
  let plan: ReturnType<typeof getPlanByPriceId> = null
  if (session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(
      typeof session.subscription === 'string' ? session.subscription : session.subscription.id
    )
    const priceId = subscription.items.data[0]?.price?.id
    if (priceId) {
      plan = getPlanByPriceId(priceId)
    }
  }

  // Fallback : plan depuis metadata
  if (!plan && session.metadata?.plan) {
    plan = session.metadata.plan as Parameters<typeof getPlanByPriceId>[0] extends string | undefined ? never : ReturnType<typeof getPlanByPriceId>
  }

  if (!plan) {
    return NextResponse.json({ error: 'plan_not_found' }, { status: 404 })
  }

  return NextResponse.json({ plan })
}
