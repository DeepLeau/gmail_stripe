import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getStripe } from '@/lib/stripe/config'
import { headers } from 'next/headers'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { sessionId } = body as { sessionId: string }

  if (!sessionId) {
    return NextResponse.json({ error: 'session_id_required' }, { status: 400 })
  }

  // Récupérer l'user_id depuis le cookie de session Supabase
  const supabaseService = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  ) as any

  // Get user from the current session (cookie-based)
  const headersList = await headers()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  // Use anon key client with cookie access to get the user
  const { data: { user }, error: authError } = await supabaseService.auth.getUser()

  if (authError || !user) {
    // Pas d'utilisateur connecté — on ne peut pas lier
    return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
  }

  const userId = user.id

  // Retrieve checkout session from Stripe
  const stripe = getStripe()
  let checkoutSession: Stripe.Checkout.Session
  try {
    checkoutSession = await stripe.checkout.sessions.retrieve(sessionId)
  } catch (err) {
    console.error('[link-session] Failed to retrieve session:', err)
    return NextResponse.json({ error: 'invalid_session' }, { status: 400 })
  }

  const customerId = typeof checkoutSession.customer === 'string'
    ? checkoutSession.customer
    : null

  if (!customerId) {
    return NextResponse.json({ error: 'no_customer' }, { status: 400 })
  }

  // Lier le customer Stripe à l'user_id via la table user_subscriptions
  // Chercher si un pending_checkout existe pour ce customer
  const { data: pending } = await supabaseService
    .from('pending_checkouts')
    .select('*')
    .eq('stripe_customer_id', customerId)
    .is('linked_user_id', null)
    .maybeSingle()

  if (pending) {
    // Mettre à jour le staging avec l'user_id
    await supabaseService
      .from('pending_checkouts')
      .update({ linked_user_id: userId })
      .eq('stripe_customer_id', customerId)
      .is('linked_user_id', null)
  }

  // Mettre à jour user_subscriptions si une row existe déjà (flow: user a signé AVANT le webhook)
  const { data: existing } = await supabaseService
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle()

  if (!existing) {
    // Pas encore de row user_subscriptions — le webhook va la créer
    // On crée une row pending pour que le webhook l'utilise
    await supabaseService
      .from('pending_checkouts')
      .upsert({
        stripe_customer_id: customerId,
        stripe_session_id: sessionId,
        linked_user_id: userId,
        customer_email: checkoutSession.customer_details?.email ?? checkoutSession.customer_email,
        plan: checkoutSession.metadata?.plan,
      }, {
        onConflict: 'stripe_customer_id',
        ignoreDuplicates: false,
      })
  }

  return NextResponse.json({ success: true, customer_id: customerId })
}
