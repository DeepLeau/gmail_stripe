'use server'

import { NextResponse } from 'next/server'
import { validatePlanSlug, getPlanBySlug } from '@/lib/plans'
import { getStripe } from '@/lib/stripe/config'

export async function createCheckoutSession(planSlug: string) {
  // Validate slug
  if (!validatePlanSlug(planSlug)) {
    return NextResponse.json(
      { error: 'Invalid plan' },
      { status: 400 }
    )
  }

  const plan = getPlanBySlug(planSlug)
  if (!plan || !plan.priceId) {
    return NextResponse.json(
      { error: 'Plan price not configured' },
      { status: 500 }
    )
  }

  const stripe = getStripe()

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [
      {
        price: plan.priceId,
        quantity: 1,
      },
    ],
    success_url:
      `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/signup?session_id={CHECKOUT_SESSION_ID}&email={EMAIL}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/`,
  })

  return NextResponse.json({ url: session.url })
}
