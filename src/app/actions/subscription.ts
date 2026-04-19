'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createAccountWithSubscription(
  sessionId: string,
  email: string,
  password: string
): Promise<{ error?: string }> {
  const supabase = await createClient()

  // Retrieve Stripe session to get plan info
  const stripeSessionRes = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/retrieve-session`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    }
  )

  if (!stripeSessionRes.ok) {
    return { error: 'Impossible de vérifier le paiement. Veuillez réessayer.' }
  }

  const stripeSession = await stripeSessionRes.json()

  if (stripeSession.payment_status !== 'paid') {
    return { error: 'Le paiement n\'a pas été confirmé.' }
  }

  // Create Supabase auth user
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: email.trim(),
    password,
  })

  if (signUpError) {
    const message = signUpError.message === 'User already registered'
      ? 'Un compte existe déjà avec cet email'
      : 'Une erreur est survenue lors de la création du compte'
    return { error: message }
  }

  const userId = authData.user?.id
  if (!userId) {
    return { error: 'Impossible de récupérer les informations utilisateur.' }
  }

  // Insert subscription record
  const { error: insertError } = await supabase.from('user_subscriptions').insert({
    user_id: userId,
    stripe_customer_id: stripeSession.customer_id || '',
    stripe_subscription_id: stripeSession.subscription_id || '',
    stripe_session_id: sessionId,
    plan: stripeSession.plan || 'start',
    messages_limit: stripeSession.messages_limit || 100,
    messages_used: 0,
    subscription_status: 'active',
    current_period_start: new Date().toISOString(),
    current_period_end: stripeSession.period_end || null,
  })

  if (insertError) {
    // Log but don't fail - user account was created
    console.error('Subscription insert error:', insertError)
  }

  redirect('/chat')
}
