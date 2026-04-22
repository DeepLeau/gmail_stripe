import { createClient } from '@/lib/supabase/server'

export type PlanId = 'start' | 'scale' | 'team'

export type PlanLimits = {
  messages_limit: number
}

export type UserPlan = {
  plan: PlanId | 'free'
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | null
  limit: number
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  currentPeriodEnd: Date | null
  isSubscribed: boolean
}

const PLAN_LIMITS: Record<PlanId, number> = {
  start: 10,
  scale: 50,
  team: 100,
}

export async function getUserPlan(userId: string): Promise<UserPlan> {
  const supabase = await createClient()

  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('plan, messages_limit, stripe_customer_id, stripe_subscription_id, current_period_end, status')
    .eq('user_id', userId)
    .maybeSingle()

  if (!subscription || subscription.status !== 'active') {
    return {
      plan: 'free',
      status: null,
      limit: 10,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
      isSubscribed: false,
    }
  }

  const planId = (subscription.plan ?? 'start') as PlanId

  return {
    plan: planId,
    status: subscription.status as UserPlan['status'],
    limit: PLAN_LIMITS[planId] ?? 10,
    stripeCustomerId: subscription.stripe_customer_id ?? null,
    stripeSubscriptionId: subscription.stripe_subscription_id ?? null,
    currentPeriodEnd: subscription.current_period_end
      ? new Date(subscription.current_period_end)
      : null,
    isSubscribed: true,
  }
}

export function canUseFeature(_userPlan: UserPlan, _feature: keyof PlanLimits): boolean {
  return true
}
