'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getStripe } from '@/lib/stripe/config'
import { createClient } from '@/lib/supabase/server'

/**
 * Server Action to finalize signup after successful Stripe payment.
 * Called from /signup/success page after Stripe redirects back.
 */
export async function finalizeSignupAfterPayment(sessionId: string): Promise<void> {
  // Retrieve the Stripe checkout session
  const stripe = getStripe()
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  if (session.payment_status !== 'paid') {
    // Payment not completed, redirect to login
    redirect('/login')
  }

  // Get user ID from metadata
  const userId = session.metadata?.user_id
  const plan = session.metadata?.plan as 'start' | 'scale' | 'team' | undefined

  if (!userId || !plan) {
    redirect('/login')
  }

  const supabase = await createClient()

  // Update subscription status to active
  const { error: subError } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('plan', plan)

  if (subError) {
    console.error('Failed to activate subscription:', subError)
    redirect('/login')
  }

  // Insert/update user_messages record
  const messagesLimits: Record<string, number> = {
    start: 10,
    scale: 50,
    team: 100,
  }
  const messagesLimit = messagesLimits[plan] ?? 10

  const { error: msgError } = await supabase
    .from('user_messages')
    .upsert(
      {
        user_id: userId,
        messages_used: 0,
        messages_limit: messagesLimit,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

  if (msgError) {
    console.error('Failed to insert user_messages:', msgError)
    // Non-critical, continue to chat
  }

  // Delete the stripe_session_id cookie
  const cookieStore = await cookies()
  cookieStore.delete('stripe_session_id')

  // Redirect to chat
  redirect('/chat')
}
