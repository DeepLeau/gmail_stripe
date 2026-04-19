import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/config'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId } = body as { sessionId: string }

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'invalid_session' }, { status: 400 })
    }

    const supabase = await createClient()

    // Vérifier que la session n'a pas déjà été confirmée
    const { data: existingSession } = await (supabase as any)
      .from('stripe_sessions')
      .select('confirmed, expires_at, plan')
      .eq('stripe_session_id', sessionId)
      .maybeSingle()

    if (existingSession?.confirmed) {
      return NextResponse.json({ error: 'session_already_used' }, { status: 400 })
    }

    // Vérifier expiration
    if (existingSession?.expires_at) {
      const expiry = new Date(existingSession.expires_at)
      if (expiry < new Date()) {
        return NextResponse.json({ error: 'session_expired' }, { status: 400 })
      }
    }

    // Récupérer la session Stripe pour avoir l'email
    const stripe = getStripe()
    let stripeSession: ReturnType<typeof stripe.checkout.sessions.retrieve> extends Promise<infer T> ? T : never
    try {
      stripeSession = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription'],
      })
    } catch {
      return NextResponse.json({ error: 'invalid_session' }, { status: 400 })
    }

    const customerEmail = stripeSession.customer_details?.email
    if (!customerEmail) {
      return NextResponse.json({ error: 'invalid_session' }, { status: 400 })
    }

    if (stripeSession.payment_status !== 'paid') {
      return NextResponse.json({ error: 'invalid_session' }, { status: 400 })
    }

    const plan = (stripeSession.metadata?.planId) ?? 'free'
    const messagesLimit = getPlanMessageLimit(plan)

    return NextResponse.json({
      customerEmail,
      plan,
      messagesLimit,
      stripeSessionId: stripeSession.id,
      stripeCustomerId: stripeSession.customer as string,
      stripeSubscriptionId: stripeSession.subscription as string | null,
    })
  } catch (err) {
    console.error('[Stripe] confirm error:', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

function getPlanMessageLimit(plan: string): number {
  const limits: Record<string, number> = {
    start: 10,
    scale: 50,
    team: 100,
  }
  return limits[plan] ?? 10
}
