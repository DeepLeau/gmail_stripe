/**
 * src/app/api/stripe/webhook/route.ts
 *
 * Stub minimal pour laisser le build passer.
 * Le vrai webhook sera régénéré quand le package 'stripe' sera installé.
 */
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(_request: NextRequest) {
  console.warn('[Stripe webhook] Stub — stripe package not installed yet')
  return NextResponse.json({ received: true })
}
