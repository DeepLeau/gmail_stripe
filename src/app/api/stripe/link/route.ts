/**
 * src/app/api/stripe/link/route.ts
 *
 * Route API pour lier un utilisateur fraichement créé à une session Stripe
 * en attente (flow guest → signup).
 *
 * Appelé par SignupForm.tsx après supabase.auth.signUp().
 *
 * POST /api/stripe/link
 * Body: { sessionId: string, userId: string }
 *
 * Logique :
 * 1. Retrieve la Checkout Session côté Stripe pour vérifier qu'elle appartient
 *    bien à un guest non encore lié.
 * 2. INSERT/UPDATE la table pending_checkouts avec linked_user_id.
 * 3. Si l'user a déjà un subscription record (upsert), on fait rien de plus.
 *    Si pas, upsert user_subscriptions avec les infos de la session.
 *
 * Erreurs :
 * - 400 : body manquant ou sessionId/userId invalides
 * - 404 : session Stripe non trouvée
 * - 500 : erreur RPC ou Stripe
 */
import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let body: { sessionId?: string; userId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const { sessionId, userId } = body
  if (!sessionId || typeof sessionId !== 'string') {
    return NextResponse.json({ error: 'missing_session_id' }, { status: 400 })
  }
  if (!userId || typeof userId !== 'string') {
    return NextResponse.json({ error: 'missing_user_id' }, { status: 400 })
  }

  const stripe = getStripe()

  // Retrieve la session Stripe pour vérifier son état
  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId)
  } catch (err) {
    console.error('[Stripe link] Failed to retrieve session:', err)
    return NextResponse.json({ error: 'checkout_not_found' }, { status: 404 })
  }

  // Vérifier qu'un user_id n'est pas déjà assigné sur la session (link déjà fait)
  if (session.client_reference_id && session.client_reference_id !== userId) {
    // client_reference_id pointe vers un autre user — refusé
    return NextResponse.json({ error: 'session_already_linked' }, { status: 409 })
  }

  const customerId =
    typeof session.customer === 'string' ? session.customer : null
  if (!customerId) {
    return NextResponse.json({ error: 'no_customer_on_session' }, { status: 400 })
  }

  // Créer le client Supabase avec service_role pour bypasser RLS
  const { createServerClient } = await import('@supabase/ssr')
  const supabase = createServerClient(
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

  // Mise à jour de pending_checkouts pour marquer le lien
  const { error: pendingError } = await supabase
    .from('pending_checkouts')
    .update({ linked_user_id: userId })
    .eq('stripe_session_id', sessionId)

  if (pendingError) {
    console.error('[Stripe link] failed to update pending_checkouts:', pendingError)
  }

  // Upsert user_subscriptions — on utilise apply_subscription_change RPC
  // si customer_id existe déjà, la RPC fait un UPDATE; sinon INSERT
  const { error: rpcError } = await supabase.rpc('apply_subscription_change', {
    p_user_id: userId,
    p_plan: null,           // plan lu depuis pending_checkouts ou laissé null
    p_units_limit: null,
    p_stripe_customer_id: customerId,
    p_stripe_subscription_id:
      typeof session.subscription === 'string' ? session.subscription : null,
    p_stripe_session_id: sessionId,
    p_subscription_status: session.payment_status ?? 'unknown',
    p_current_period_start: null,
    p_current_period_end: null,
    p_customer_email: session.customer_details?.email ?? null,
    p_reset_units: false,
  })

  if (rpcError) {
    console.error('[Stripe link] apply_subscription_change failed:', rpcError)
    return NextResponse.json({ error: 'db_error', detail: rpcError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
