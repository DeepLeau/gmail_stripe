import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
    }

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    return NextResponse.json({
      status: session.status,
      planId: session.metadata?.plan_id ?? null,
      customerEmail: session.customer_details?.email ?? session.customer_email ?? null,
    })
  } catch (error) {
    console.error('Verify session error:', error)
    return NextResponse.json({ error: 'Failed to verify session' }, { status: 500 })
  }
}
