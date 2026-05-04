'use server'

import { createClient } from '@/lib/supabase/server'

interface LinkResult {
  linked: boolean
  error?: string
}

/**
 * Links a Stripe checkout session to the currently authenticated user.
 * Called after a successful sign-up from the /signup page (guest payment flow).
 *
 * Calls the RPC `link_stripe_session_to_user(p_session_id)` via service role
 * to migrate the pending_checkout row into user_subscriptions.
 */
export async function linkStripeSessionToUser(
  sessionId: string
): Promise<LinkResult> {
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    return { linked: false, error: 'No authenticated user' }
  }

  const { data, error } = await supabase.rpc('link_stripe_session_to_user', {
    p_session_id: sessionId,
  })

  if (error) {
    return { linked: false, error: error.message }
  }

  const result = data as { success: boolean; error?: string }
  if (result.success) {
    return { linked: true }
  }

  return { linked: false, error: result.error ?? 'Link failed' }
}

/**
 * Creates a Stripe Checkout session for the given plan.
 * Redirects the browser to the Stripe-hosted checkout page.
 *
 * @param planId - One of: 'start', 'scale', 'team'
 * @returns The checkout session URL to redirect to
 */
export async function createCheckoutSession(planId: string): Promise<{ url?: string; error?: string }> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/stripe/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: planId }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      return { error: (data as { error?: string }).error ?? 'checkout_failed' }
    }

    const data = await response.json() as { url?: string; error?: string }
    return data
  } catch (err) {
    console.error('[createCheckoutSession] fetch error:', err)
    return { error: 'network_error' }
  }
}
