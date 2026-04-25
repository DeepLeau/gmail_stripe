import { NextRequest, NextResponse } from 'next/server';
import { getStripe, getPriceId, isValidPlan, StripePlanName } from '@/lib/stripe/config';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId } = body;

    if (!planId || !isValidPlan(planId as StripePlanName)) {
      return NextResponse.json(
        { error: 'Plan invalide. Formats acceptés: start, scale, team' },
        { status: 400 }
      );
    }

    const priceId = getPriceId(planId as StripePlanName);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        plan_id: planId,
      },
      success_url: `${baseUrl}/signup?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      subscription_data: {
        metadata: {
          plan_id: planId,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session checkout' },
      { status: 500 }
    );
  }
}
