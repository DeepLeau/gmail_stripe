import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
  }

  try {
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ valid: false }, { status: 400 })
    }

    return NextResponse.json({
      valid: true,
      customerId: session.customer,
      plan: session.metadata?.plan,
    })
  } catch (error) {
    return NextResponse.json({ valid: false }, { status: 400 })
  }
}
