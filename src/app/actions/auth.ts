'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

interface SignupParams {
  email: string
  password: string
  stripeSessionId?: string
}

export async function signupAction(params: SignupParams) {
  const supabase = await createClient()
  const cookieStore = await cookies()

  // Check for stripe session ID in params or cookie
  let stripeSessionId = params.stripeSessionId

  if (!stripeSessionId) {
    const pendingSessionCookie = cookieStore.get('pending_stripe_session_id')
    if (pendingSessionCookie) {
      stripeSessionId = pendingSessionCookie.value
    }
  }

  // Create user
  const { data, error } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
  })

  if (error) {
    return { error: error.message }
  }

  // If we have a pending Stripe session, link it
  if (stripeSessionId && data.user) {
    try {
      // Clear the cookie
      cookieStore.delete('pending_stripe_session_id')

      // Call the link endpoint
      const linkResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/link-pending-session`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stripe_session_id: stripeSessionId }),
        }
      )

      if (!linkResponse.ok) {
        console.error('[signupAction] Failed to link Stripe session:', await linkResponse.text())
        // Don't fail the signup, just log the error
      }
    } catch (err) {
      console.error('[signupAction] Error linking Stripe session:', err)
      // Don't fail the signup, just log the error
    }
  }

  return { success: true, user: data.user }
}
