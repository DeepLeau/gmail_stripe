/**
 * GET /api/checkout/verify?session_id={CHECKOUT_SESSION_ID}
 *
 * Verifies a Stripe Checkout session is paid and returns the plan.
 *
 * Auth: requires a valid Supabase session cookie.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseServer } from '@/lib/supabase/server'
import { getStripeClient } from '@/lib/stripe/client'
import { getPlan } from '@/lib/subscription/plans'

export async function GET(request: NextRequest) {
  // ── 1. Auth check ──────────────────────────────────────────────────────────
  const supabase = await createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── 2. Parse session_id ────────────────────────────────────────────────────
  const sessionId = request.nextUrl.searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json(
      { status: 'error', error: 'Missing session_id' },
      { status: 400 }
    )
  }

  // ── 3. Retrieve Stripe session ─────────────────────────────────────────────
  try {
    const stripe = getStripeClient()
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { status: 'error', error: `Payment status: ${session.payment_status}` },
        { status: 400 }
      )
    }

    const planId = session.metadata?.plan_id ?? null
    const plan = getPlan(planId)

    return NextResponse.json({
      status: 'ok',
      plan: planId,
      planName: plan?.name ?? planId,
    })
  } catch (err) {
    console.error('[checkout/verify] Stripe error:', err)
    return NextResponse.json(
      { status: 'error', error: 'Failed to retrieve session' },
      { status: 500 }
    )
  }
}
