'use server'

import { createClient } from '@/lib/supabase/server'

type DecrementQuotaResult =
  | { success: true; messagesUsed: number; messagesLimit: number; reset: boolean }
  | { error: 'Quota exceeded'; messagesUsed: number; messagesLimit: number }
  | { error: 'No active subscription' }
  | { error: 'Failed to update quota'; details: string }

/**
 * Server Action to decrement the user's monthly message quota.
 * Handles automatic monthly reset if a new month has started.
 */
export async function decrementQuota(userId: string): Promise<DecrementQuotaResult> {
  const supabase = await createClient()

  // Fetch current subscription
  const { data: subscription, error: subError } = await supabase
    .from('user_subscriptions')
    .select('messages_used, messages_limit, updated_at')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (subError || !subscription) {
    return { error: 'No active subscription' }
  }

  // Check if we need to reset for a new month
  const lastUpdate = new Date(subscription.updated_at)
  const now = new Date()
  const isNewMonth = lastUpdate.getMonth() !== now.getMonth() || lastUpdate.getFullYear() !== now.getFullYear()

  if (isNewMonth) {
    // Reset quota for new month
    const { error: resetError } = await supabase
      .from('user_subscriptions')
      .update({
        messages_used: 1,
        updated_at: now.toISOString(),
      })
      .eq('user_id', userId)
      .eq('status', 'active')

    if (resetError) {
      return { error: 'Failed to update quota', details: resetError.message }
    }

    return { success: true, messagesUsed: 1, messagesLimit: subscription.messages_limit, reset: true }
  }

  // Check if quota is already exceeded
  if (subscription.messages_used >= subscription.messages_limit) {
    return {
      error: 'Quota exceeded',
      messagesUsed: subscription.messages_used,
      messagesLimit: subscription.messages_limit,
    }
  }

  // Increment usage
  const { error: updateError } = await supabase
    .from('user_subscriptions')
    .update({
      messages_used: subscription.messages_used + 1,
      updated_at: now.toISOString(),
    })
    .eq('user_id', userId)
    .eq('status', 'active')

  if (updateError) {
    return { error: 'Failed to update quota', details: updateError.message }
  }

  return {
    success: true,
    messagesUsed: subscription.messages_used + 1,
    messagesLimit: subscription.messages_limit,
    reset: false,
  }
}
