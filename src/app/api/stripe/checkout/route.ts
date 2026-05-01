import { NextRequest, NextResponse } from 'next/server';
import { getPriceId, isValidPlan, getStripe } from '@/lib/stripe/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, userId } = body as { plan: string; userId?: string };

    if (!isValidPlan(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be one of: starter, growth, pro' },
        { status: 400 }
      );
    }

    const priceId = getPriceId(plan);

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID not configured for this plan' },
        { status: 500 }
      );
    }

    const stripe = getStripe();

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=true`,
      metadata: {
        userId: userId || '',
        plan,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}