import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

interface SignupBody {
  email: string
  password: string
  pendingSessionToken?: string
}

/**
 * POST /api/auth/signup
 *
 * Crée un compte Supabase Auth et lie une session Stripe en attente (pending_checkouts).
 * Utilisé quand l'utilisateur a payé avant de créer son compte.
 */
export async function POST(request: NextRequest) {
  let body: SignupBody

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const { email, password, pendingSessionToken } = body

  if (!email || !password) {
    return NextResponse.json({ error: 'email_and_password_required' }, { status: 400 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Créer le compte utilisateur
  const { data: authData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (signUpError) {
    const message =
      signUpError.message === 'User already registered'
        ? 'Un compte existe déjà avec cet email'
        : signUpError.message
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const user = authData.user
  if (!user) {
    return NextResponse.json({ error: 'user_creation_failed' }, { status: 500 })
  }

  // 2. Si un pendingSessionToken est fourni, lier la session Stripe en attente
  if (pendingSessionToken) {
    // Retrieve the pending checkout via stripe_session_id
    const { data: pending } = await supabaseAdmin
      .from('pending_checkouts')
      .select('stripe_customer_id, stripe_session_id')
      .eq('stripe_session_id', pendingSessionToken)
      .is('linked_user_id', null)
      .maybeSingle()

    if (pending) {
      // Update pending_checkouts with user_id
      await supabaseAdmin
        .from('pending_checkouts')
        .update({ linked_user_id: user.id })
        .eq('stripe_session_id', pendingSessionToken)

      // Upsert into user_subscriptions using the stripe_customer_id
      const { data: subData } = await supabaseAdmin
        .from('pending_checkouts')
        .select('plan, subscription_status, current_period_start, current_period_end')
        .eq('stripe_session_id', pendingSessionToken)
        .maybeSingle()

      if (subData) {
        await supabaseAdmin.from('user_subscriptions').upsert({
          user_id: user.id,
          stripe_customer_id: pending.stripe_customer_id,
          stripe_session_id: pendingSessionToken,
          plan: subData.plan,
          subscription_status: subData.subscription_status ?? 'active',
          current_period_start: subData.current_period_start,
          current_period_end: subData.current_period_end,
        })
      }
    }
  }

  return NextResponse.json({ success: true, userId: user.id })
}
