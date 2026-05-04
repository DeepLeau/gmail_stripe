import { NextRequest, NextResponse } from 'next/server'
import { linkStripeSessionToUser } from '@/app/actions/stripe'

/**
 * GET /api/stripe/link?session_id=...&user_id=...
 *
 * Called by middleware when a connected user lands on /signup?session_id=...
 * after completing a Stripe checkout.
 *
 * Encapsulates the linkStripeSessionToUser server action so the middleware
 * can invoke it without importing server-only logic directly.
 */
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ linked: false, error: 'Missing session_id' }, { status: 400 })
  }

  const result = await linkStripeSessionToUser(sessionId)

  return NextResponse.json(result)
}
