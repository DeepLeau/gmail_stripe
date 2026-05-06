'use server'

import { createClient } from '@/lib/supabase/server'
import { linkStripeSessionToUser } from '@/app/actions/subscription'
import { redirect } from 'next/navigation'

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function signupAndLinkStripe(
  email: string,
  password: string,
  pendingSessionId?: string
) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error || !data.user) {
    return { ok: false, error: error?.message ?? 'Signup failed' }
  }

  if (pendingSessionId) {
    const linkResult = await linkStripeSessionToUser(pendingSessionId)
    if (!linkResult.success) {
      console.error('Stripe session linking failed:', linkResult.error)
    }
  }

  return { ok: true, user: data.user }
}
