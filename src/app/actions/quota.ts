'use server'

import { createClient } from '@/lib/supabase/server'

type DecrementUnitsResult =
  | { success: true; remaining: number; plan: string; subscription_status: string }
  | { success: false; error: 'no_subscription' | 'limit_reached' | string; remaining: number }

export async function decrementUnits(): Promise<DecrementUnitsResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'not_authenticated', remaining: 0 }
  }

  // Check if user has a subscription row
  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('user_id, units_limit, units_used, plan, subscription_status')
    .eq('user_id', user.id)
    .maybeSingle()

  // If no subscription row exists, create a free plan entry
  if (!sub) {
    const { error: insertError } = await supabase.rpc('apply_subscription_change', {
      p_user_id: user.id,
      p_plan: 'free',
      p_stripe_customer_id: '',
      p_stripe_session_id: '',
      p_stripe_subscription_id: '',
      p_customer_email: user.email ?? '',
      p_subscription_status: 'active',
      p_units_limit: 0,
      p_current_period_start: new Date().toISOString(),
      p_current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      p_reset_units: false,
    })

    if (insertError) {
      console.error('[decrementUnits] Failed to create free subscription:', insertError)
      return { success: false, error: 'db_error', remaining: 0 }
    }

    return { success: false, error: 'no_subscription', remaining: 0 }
  }

  // Check if limit is already reached
  const remaining = sub.units_limit - sub.units_used
  if (remaining <= 0) {
    return { success: false, error: 'limit_reached', remaining: 0 }
  }

  // Call decrement_units RPC
  const { data, error } = await supabase.rpc('decrement_units')

  if (error) {
    console.error('[decrementUnits] RPC error:', error)
    return { success: false, error: 'rpc_error', remaining }
  }

  // RPC returns the new remaining count
  const newRemaining = typeof data === 'number' ? data : (data?.remaining as number | undefined) ?? remaining - 1

  return {
    success: true,
    remaining: newRemaining,
    plan: sub.plan ?? 'free',
    subscription_status: sub.subscription_status ?? 'active',
  }
}
