'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

/**
 * Finalizes signup after successful Stripe payment.
 *
 * Flow:
 *  1. Retrieve the Stripe Checkout Session to verify payment_status = 'paid'
 *  2. Activate the pending subscription in user_subscriptions
 *  3. Insert a user_messages record with messages_used = 0
 *  4. Clear the stripe_session_id cookie
 *  5. Redirect to /chat on success, /login on error
 */
export async function finalizeSignupAfterPayment(sessionId: string) {
  const supabase = await createClient()

  // --- Step 1: Verify payment with Stripe ---
  const { getStripe } = await import('@/lib/stripe/config')
  const stripe = getStripe()

  let stripeSession: Awaited<ReturnType<typeof stripe.checkout.sessions.retrieve>>
  try {
    stripeSession = await stripe.checkout.sessions.retrieve(sessionId)
  } catch (err) {
    console.error('[finalizeSignupAfterPayment] Failed to retrieve Stripe session:', err)
    redirect('/login')
  }

  if (stripeSession.payment_status !== 'paid') {
    console.warn('[finalizeSignupAfterPayment] Session not paid:', stripeSession.payment_status)
    redirect('/login')
  }

  // --- Step 2: Activate pending subscription ---
  const pendingUserId = stripeSession.metadata?.pending_user_id
  if (!pendingUserId) {
    console.error('[finalizeSignupAfterPayment] No pending_user_id in session metadata')
    redirect('/login')
  }

  const planFromSession = stripeSession.metadata?.plan as string | undefined
  const { error: subscriptionError } = await supabase
    .from('user_subscriptions')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('user_id', pendingUserId)
    .eq('status', 'pending')

  if (subscriptionError) {
    console.error('[finalizeSignupAfterPayment] Failed to activate subscription:', subscriptionError)
    redirect('/login')
  }

  // --- Step 3: Insert user_messages record ---
  const { error: messagesError } = await supabase.from('user_messages').upsert(
    {
      user_id: pendingUserId,
      messages_used: 0,
      messages_limit: planFromSession ? getMessagesLimit(planFromSession) : 10,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  if (messagesError) {
    // Non-fatal: subscription is already active — log and continue
    console.warn('[finalizeSignupAfterPayment] Failed to insert user_messages:', messagesError)
  }

  // --- Step 4: Clear cookie ---
  // The cookie is read by the success page client-side and passed here.
  // We clear it via the server response headers handled by the page.

  // --- Step 5: Redirect to chat ---
  redirect('/chat')
}

/** Maps plan name to messages limit. Keep in sync with src/lib/data.ts */
function getMessagesLimit(plan: string): number {
  const limits: Record<string, number> = {
    start: 10,
    scale: 50,
    team: 100,
  }
  return limits[plan] ?? 10
}
