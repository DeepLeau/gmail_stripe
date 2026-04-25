import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/config';

export const dynamic = 'force-dynamic';

const PRICE_IDS: Record<string, string | undefined> = {
  start: process.env.STRIPE_PRICE_ID_START,
  scale: process.env.STRIPE_PRICE_ID_SCALE,
  team: process.env.STRIPE_PRICE_ID_TEAM,
};

const VALID_PLANS = ['start', 'scale', 'team'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId } = body;

    if (!planId || typeof planId !== 'string') {
      return NextResponse.json({ error: 'planId is required' }, { status: 400 });
    }

    if (!VALID_PLANS.includes(planId)) {
      return NextResponse.json({ error: 'Invalid plan. Must be start, scale, or team' }, { status: 400 });
    }

    const priceId = PRICE_IDS[planId];
    if (!priceId) {
      return NextResponse.json({ error: 'Price ID not configured for this plan' }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { plan_id: planId },
      success_url: `${baseUrl}/signup?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      subscription_data: {
        metadata: { plan_id: planId },
      },
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
