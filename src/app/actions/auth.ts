'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

type SignUpResult = 
  | { success: true }
  | { success: false; error: string }

export async function signUpAction(
  email: string,
  password: string,
  sessionId?: string
): Promise<SignUpResult> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    if (error.message === 'User already registered') {
      return { success: false, error: 'user_already_exists' }
    }
    return { success: false, error: 'unknown' }
  }

  if (!data.user) {
    return { success: false, error: 'unknown' }
  }

  const userId = data.user.id

  // Si un sessionId Stripe est passé, récupérer le plan et créer le profil
  if (sessionId) {
    try {
      // Récupérer les infos du plan depuis Stripe via l'API
      const planResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stripe/session/${sessionId}`
      )

      if (planResponse.ok) {
        const planData = await planResponse.json()
        const plan = planData.plan || 'start'

        // Créer le profil utilisateur avec le plan Stripe
        await supabase.from('user_profiles').insert({
          user_id: userId,
          plan,
          stripe_session_id: sessionId,
        })

        // Initialiser le quota de messages selon le plan
        const messagesLimit = planData.messagesLimit || 10
        await supabase.from('message_usage').insert({
          user_id: userId,
          messages_limit: messagesLimit,
          messages_sent: 0,
        })
      } else {
        // Fallback : créer un profil avec le plan par défaut (start)
        await supabase.from('user_profiles').insert({
          user_id: userId,
          plan: 'start',
          stripe_session_id: sessionId,
        })

        await supabase.from('message_usage').insert({
          user_id: userId,
          messages_limit: 10,
          messages_sent: 0,
        })
      }
    } catch {
      // En cas d'erreur, créer quand même le profil avec le plan par défaut
      await supabase.from('user_profiles').insert({
        user_id: userId,
        plan: 'start',
        stripe_session_id: sessionId,
      })

      await supabase.from('message_usage').insert({
        user_id: userId,
        messages_limit: 10,
        messages_sent: 0,
      })
    }
  } else {
    // Pas de sessionId : créer un profil gratuit (free)
    await supabase.from('user_profiles').insert({
      user_id: userId,
      plan: 'free',
    })

    await supabase.from('message_usage').insert({
      user_id: userId,
      messages_limit: 10,
      messages_sent: 0,
    })
  }

  return { success: true }
}
