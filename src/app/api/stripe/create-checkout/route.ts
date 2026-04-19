/**
 * POST /api/stripe/create-checkout
 *
 * Body: { planId: 'start' | 'scale' | 'team' }
 * Returns: { checkoutUrl: string } | error
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createCheckoutSession,
  isValidPlan,
  type StripePlanId,
} from '@/lib/stripe/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let body: { planId?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { planId: rawPlanId } = body

  if (!rawPlanId || typeof rawPlanId !== 'string') {
    return NextResponse.json({ error: 'Invalid planId' }, { status: 400 })
  }

  if (!isValidPlan(rawPlanId)) {
    return NextResponse.json({ error: 'Invalid planId' }, { status: 400 })
  }

  const planId = rawPlanId as StripePlanId

  // ── Create checkout session ─────────────────────────────────────────────────
  // Note: success_url et cancel_url sont déjà hardcodés dans createCheckoutSession
  try {
    const { checkoutUrl } = await createCheckoutSession({
      planId,
      userId: user.id,
      userEmail: user.email ?? '',
    })

    return NextResponse.json({ checkoutUrl })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Internal server error'

    if (message.includes('environment variable is not set')) {
      return NextResponse.json(
        { error: 'Stripe not configured — price ID missing' },
        { status: 400 }
      )
    }

    console.error('[create-checkout] Stripe error:', message)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
