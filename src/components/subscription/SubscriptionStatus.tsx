import { createClient } from '@/lib/supabase/server'

interface SubscriptionData {
  plan: string
  messages_limit: number
  messages_used: number
}

async function getSubscription(userId: string): Promise<SubscriptionData | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('plan, messages_limit, messages_used')
      .eq('user_id', userId)
      .single()

    if (error || !data) return null
    return data as SubscriptionData
  } catch {
    return null
  }
}

function formatPlanName(plan: string): string {
  const map: Record<string, string> = {
    free: 'Gratuit',
    start: 'Start',
    scale: 'Scale',
    team: 'Team',
  }
  return map[plan] ?? plan.charAt(0).toUpperCase() + plan.slice(1)
}

export async function SubscriptionStatus() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return (
        <span className="text-xs text-[var(--text-3)] px-2 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)]">
          Compte gratuit
        </span>
      )
    }

    const sub = await getSubscription(user.id)

    if (!sub) {
      return (
        <span className="text-xs text-[var(--text-3)] px-2 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)]">
          Compte gratuit
        </span>
      )
    }

    const remaining = sub.messages_limit - sub.messages_used
    const planName = formatPlanName(sub.plan)

    return (
      <span
        className="text-xs px-2.5 py-1 rounded-full font-medium border"
        style={{
          backgroundColor: 'var(--accent-light)',
          color: 'var(--accent)',
          borderColor: 'rgba(59, 130, 246, 0.25)',
        }}
      >
        {planName} · {remaining}/{sub.messages_limit}&nbsp;msgs
      </span>
    )
  } catch {
    // Silent fallback — do not throw in a Server Component
    return (
      <span className="text-xs text-[var(--text-3)] px-2 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)]">
        Compte gratuit
      </span>
    )
  }
}
