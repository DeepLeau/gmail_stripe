'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function signupWithPlanAction(formData: FormData, sessionId?: string) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Link Stripe session if provided (user came from checkout flow)
  if (sessionId) {
    try {
      await fetch(new Request('/api/subscriptions/link', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }), {
        // Pass session_id via query param — the link endpoint reads it
        // and RPC call uses the signed-in user's ID to associate the subscription
      })
      // Alternative: the link endpoint itself reads session_id from query param
      await fetch(`/api/subscriptions/link?session_id=${encodeURIComponent(sessionId)}`, {
        method: 'GET',
      })
    } catch {
      // Non-blocking — user is signed up, subscription link will be retried by webhook
    }
  }

  redirect('/chat')
}
