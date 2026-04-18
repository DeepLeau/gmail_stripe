/**
 * POST /api/checkout
 *
 * Creates a Stripe Checkout session for the selected plan.
 * Validates planId, computes metadata, and returns the Stripe redirect URL.
 *
 * Auth: requires a valid Supabase session cookie.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseServer } from '@/lib/supabase/server'
import { getStripeClient } from '@/lib/stripe/client'
import { getPlan, PLAN_IDS } from '@/lib/subscription/plans'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

// In-memory ephemeral token store (cleared after account creation).
// For production at scale, replace with a Redis/Durable Object or DB row.
const ephemeralTokens = new Map<string, { planId: string; userId?: string }>()

export { ephemeralTokens }

export async function POST(request: NextRequest) {
  // ── 1. Auth check ─────────────────────────────────────────────────────────
  const supabase = await createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── 2. Parse and validate body ──────────────────────────────────────────────
  let body: { planId?: string }
  try {
    body = (await request.json()) as { planId?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { planId } = body
  if (!planId || !PLAN_IDS.includes(planId as never)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const plan = getPlan(planId)
  if (!plan) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  if (!plan.priceId) {
    return NextResponse.json(
      { error: 'Plan price ID not configured. Contact support.' },
      { status: 500 }
    )
  }

  // ── 3. Generate ephemeral token ───────────────────────────────────────────
  const token = crypto.randomUUID()
  ephemeralTokens.set(token, { planId })

  // ── 4. Build Stripe Checkout session ───────────────────────────────────────
  try {
    const stripe = getStripeClient()

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: user.email ?? undefined,
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      metadata: {
        user_id: user.id,
        plan_id: planId,
        ephemeral_token: token,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_id: planId,
        },
      },
      success_url: `${BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&token=${token}`,
      cancel_url: `${BASE_URL}/#pricing`,
    })

    if (!session.url) {
      return NextResponse.json(
        { error: 'Failed to create checkout session URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[checkout] Stripe error:', err)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
