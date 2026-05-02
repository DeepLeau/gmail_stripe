'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

type LinkStripeResult = { success: true } | { success: false; error: string }

export async function linkStripeSessionToUser(
  p_session_id: string
): Promise<LinkStripeResult> {
  // Use service_role to call the link RPC — auth uid is already in the session cookie
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'not_authenticated' }
  }

  // Call the Supabase RPC that links the Stripe session to the user
  // Uses SECURITY DEFINER so it has service_role-like access
  const { data, error } = await supabase.rpc('link_stripe_session_to_user', {
    p_session_id,
  })

  if (error) {
    console.error('[linkStripeSessionToUser] RPC error:', error)
    return { success: false, error: error.message }
  }

  // RPC returns JSON — if it throws an error it's caught above
  // A falsy data could mean the session was already linked or not found
  if (!data) {
    // Not necessarily an error — could be already linked
    return { success: true }
  }

  return { success: true }
}
