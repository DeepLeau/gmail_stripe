'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

interface SignupResult {
  success: boolean
  error?: {
    code: string
    message: string
  }
}

export async function signup(
  email: string,
  password: string,
  session_id?: string
): Promise<SignupResult> {
  const supabase = await createClient()

  if (!supabase) {
    return { success: false, error: { code: 'service_unavailable', message: 'Service temporairement indisponible' } }
  }

  // Create user via Supabase Auth
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: email.trim(),
    password,
  })

  if (signUpError) {
    if (signUpError.message === 'User already registered') {
      return { success: false, error: { code: 'email_in_use', message: 'Un compte existe déjà avec cet email' } }
    }
    return { success: false, error: { code: 'auth_error', message: 'Une erreur est survenue lors de la création du compte' } }
  }

  const userId = authData.user?.id
  if (!userId) {
    return { success: false, error: { code: 'auth_error', message: 'Erreur lors de la création du compte' } }
  }

  // Link Stripe session if provided
  if (session_id) {
    const { data: pendingData, error: pendingError } = await supabase
      .from('pending_checkouts')
      .select('*')
      .eq('stripe_session_id', session_id)
      .single()

    if (pendingError || !pendingData) {
      return { success: false, error: { code: 'session_not_found', message: 'Session de paiement introuvable' } }
    }

    if (pendingData.linked_user_id) {
      return { success: false, error: { code: 'session_already_linked', message: 'Cette session a déjà été utilisée' } }
    }

    if (pendingData.subscription_status !== 'active') {
      return { success: false, error: { code: 'session_pending', message: 'Le paiement n\'est pas encore confirmé' } }
    }

    // Plan slug → units_limit mapping
    const PLAN_UNITS: Record<string, number> = {
      starter: 50,
      growth: 200,
      pro: 1000,
    }

    const unitsLimit = PLAN_UNITS[pendingData.plan ?? ''] ?? 50

    const { error: subError } = await supabase.from('user_subscriptions').insert({
      user_id: userId,
      plan: pendingData.plan ?? 'starter',
      units_used: 0,
      units_limit: unitsLimit,
      subscription_status: 'active',
      stripe_customer_id: pendingData.stripe_customer_id ?? null,
      stripe_subscription_id: pendingData.stripe_subscription_id ?? null,
    })

    if (subError) {
      return { success: false, error: { code: 'subscription_error', message: 'Erreur lors de la création de l\'abonnement' } }
    }

    const { error: linkError } = await supabase
      .from('pending_checkouts')
      .update({ linked_user_id: userId, linked_at: new Date().toISOString() })
      .eq('stripe_session_id', session_id)

    if (linkError) {
      return { success: false, error: { code: 'link_error', message: 'Erreur lors de la liaison du compte' } }
    }
  }

  redirect('/chat')
}
