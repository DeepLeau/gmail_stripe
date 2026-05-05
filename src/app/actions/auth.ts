'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function signupAction(
  email: string,
  password: string,
  stripeSessionId?: string
) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Impossible de récupérer la session après inscription' }
  }

  if (stripeSessionId) {
    // Lecture via service_role pour pouvoir lire pending_checkouts
    const supabaseAdmin = await createClient()
    const { data: pending } = await supabaseAdmin
      .from('pending_checkouts')
      .select(
        'stripe_customer_id, stripe_subscription_id, plan, units_limit, subscription_status'
      )
      .eq('stripe_session_id', stripeSessionId)
      .single()

    if (pending) {
      if (pending.subscription_status === 'completed') {
        // Webhook déjà exécuté — insert direct
        await supabaseAdmin.from('user_subscriptions').insert({
          user_id: user.id,
          plan: pending.plan,
          stripe_customer_id: pending.stripe_customer_id,
          stripe_subscription_id: pending.stripe_subscription_id,
          subscription_status: 'active',
          units_used: 0,
          units_limit: pending.units_limit,
        })
        await supabaseAdmin
          .from('pending_checkouts')
          .update({ linked_user_id: user.id })
          .eq('stripe_session_id', stripeSessionId)
      } else {
        // Webhook pas encore exécuté — on enregistre juste linked_user_id
        // Le webhook se chargera de finaliser l'upsert via apply_subscription_change
        await supabaseAdmin
          .from('pending_checkouts')
          .update({ linked_user_id: user.id })
          .eq('stripe_session_id', stripeSessionId)
      }
    }
  }

  redirect('/chat')
}
