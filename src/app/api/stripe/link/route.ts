/**
 * src/app/api/stripe/link/route.ts
 *
 * Route appelée par SignupForm après un signUp réussi.
 * Lie un pending_checkout (Stripe session anonymous) à l'user Supabase qui vient de se créer.
 *
 * Flow : SignupForm → POST /api/stripe/link → link le checkout pending à l'user → webhook
 * peut avancer.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // Vérifier que l'user est authentifié (cookie de session Supabase)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll().map((c) => ({ name: c.name, value: c.value })),
        setAll: () => {
          // En mode edge/runtime on ne peut pas set des cookies ici, on est en réponse
        },
      },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  let body: { sessionId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const { sessionId } = body
  if (!sessionId || typeof sessionId !== 'string') {
    return NextResponse.json({ error: 'missing_session_id' }, { status: 400 })
  }

  // Retrieve la pending_checkout indexée par stripe_session_id
  const { data: pending, error: selectError } = await supabase
    .from('pending_checkouts')
    .select('id, linked_user_id')
    .eq('stripe_session_id', sessionId)
    .is('linked_user_id', null)
    .maybeSingle()

  if (selectError) {
    console.error('[Stripe link] Failed to query pending_checkouts:', selectError)
    return NextResponse.json({ error: 'database_error' }, { status: 500 })
  }

  if (!pending) {
    // Pas de pending checkout ou déjà lié — ce n'est pas une erreur (peut être un doublon)
    return NextResponse.json({ linked: false, reason: 'not_found' })
  }

  // Lier le pending checkout à l'user qui vient de signup
  const { error: updateError } = await supabase
    .from('pending_checkouts')
    .update({ linked_user_id: user.id })
    .eq('id', pending.id)

  if (updateError) {
    console.error('[Stripe link] Failed to link pending checkout:', updateError)
    return NextResponse.json({ error: 'database_error' }, { status: 500 })
  }

  return NextResponse.json({ linked: true, userId: user.id })
}
