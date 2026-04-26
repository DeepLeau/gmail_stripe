'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

type SignupResult = { success: true } | { success: false; error: string }

export async function signupWithStripeLinking(
  email: string,
  password: string,
  stripeSessionId?: string
): Promise<SignupResult> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Silently link Stripe session if provided (newly signed-up user)
  if (stripeSessionId) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/subscription/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: stripeSessionId }),
      })
    } catch {
      // Non-blocking: link will be retried via webhook or next login
    }
  }

  return { success: true }
}
