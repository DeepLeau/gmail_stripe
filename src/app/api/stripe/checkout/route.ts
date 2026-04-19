import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'

const VALID_PLANS = ['start', 'scale', 'team'] as const
type PlanId = (typeof VALID_PLANS)[number]

const PLAN_PRICE_IDS: Record<string, string | undefined> = {
  start: process.env.STRIPE_START_PRICE_ID,
  scale: process.env.STRIPE_SCALE_PRICE_ID,
  team: process.env.STRIPE_TEAM_PRICE_ID,
}

function isValidPlan(plan: string): plan is PlanId {
  return (VALID_PLANS as unknown as string[]).includes(plan)
}

function getPlanPriceId(plan: PlanId): string | null {
  return PLAN_PRICE_IDS[plan] ?? null
}

function getNextQuotaReset(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 1)
}

/**
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout Session for the selected plan.
 * Body: { plan: 'start' | 'scale' | 'team' }
 * Returns: { url: string } on success
 * Errors: 400 invalid_plan | 401 unauthorized | 500 stripe_error
 */
export async function POST(request: NextRequest) {
  // 1. Validate request body
  let body: { plan?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }

  if (typeof body.plan !== 'string' || !isValidPlan(body.plan)) {
    return NextResponse.json({ error: 'invalid_plan' }, { status: 400 })
  }

  const plan: PlanId = body.plan

  // 2. Authenticate user
  const supabase = await createSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // 3. Lazy-import Stripe to avoid build-time crash when env vars are missing
  const { default: Stripe } = await import('stripe')
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
    apiVersion: '2026-03-25.dahlia',
    telemetry: false,
  })

  // 4. Get or create Stripe customer
  const { data: billingRecord } = await supabase
    .from('user_billing')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  let stripeCustomerId: string

  if (billingRecord?.stripe_customer_id) {
    stripeCustomerId = billingRecord.stripe_customer_id
  } else {
    const stripeCustomer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    })
    stripeCustomerId = stripeCustomer.id

    await supabase.from('user_billing').upsert(
      {
        user_id: user.id,
        stripe_customer_id: stripeCustomerId,
        plan: 'free',
        subscription_status: 'inactive',
        messages_limit: 100,
        messages_used: 0,
        quota_reset_at: getNextQuotaReset().toISOString(),
      },
      { onConflict: 'user_id' }
    )
  }

  // 5. Get price ID for selected plan
  const priceId = getPlanPriceId(plan)
  if (!priceId) {
    return NextResponse.json({ error: 'stripe_error' }, { status: 500 })
  }

  // 6. Create Checkout Session
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ??
    `https://${request.headers.get('host') ?? 'localhost'}`

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/signup-with-plan?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/#pricing`,
    metadata: { plan, supabase_user_id: user.id },
    subscription_data: {
      metadata: { plan, supabase_user_id: user.id },
    },
  })

  // 7. Store pending checkout session ID
  await supabase.from('user_billing').upsert(
    {
      user_id: user.id,
      pending_checkout_session_id: session.id,
      plan: 'free',
      subscription_status: 'inactive',
      messages_limit: 100,
      messages_used: 0,
      quota_reset_at: getNextQuotaReset().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  return NextResponse.json({ url: session.url })
}
