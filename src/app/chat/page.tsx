import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChatInterface } from '@/components/chat/ChatInterface'

export const dynamic = 'force-dynamic'

function formatMessagesCount(n: number): string {
  if (n === 1) return '1 message'
  return `${n} messages`
}

const PLAN_COLORS: Record<string, string> = {
  starter: 'text-blue-600 bg-blue-50',
  growth: 'text-violet-600 bg-violet-50',
  pro: 'text-amber-600 bg-amber-50',
}

const PLAN_LABELS: Record<string, string> = {
  starter: 'Starter',
  growth: 'Growth',
  pro: 'Pro',
}

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch active subscription
  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('plan, units_limit, units_used, current_period_end')
    .eq('user_id', user.id)
    .maybeSingle()

  const plan = sub?.plan ?? null
  const unitsLimit = sub?.units_limit ?? null
  const unitsUsed = sub?.units_used ?? 0

  const remaining =
    unitsLimit !== null ? Math.max(0, unitsLimit - unitsUsed) : null

  const badgeColor = plan ? PLAN_COLORS[plan.toLowerCase()] ?? '' : ''
  const badgeLabel = plan ? PLAN_LABELS[plan.toLowerCase()] ?? plan : ''

  const isPaidPlan = plan !== null && plan !== 'free'

  return (
    <main className="flex flex-col h-screen bg-white">
      {/* Header discret */}
      <header className="shrink-0 flex items-center justify-between h-14 px-4 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-900 tracking-tight">
          Emind
        </span>
        {isPaidPlan && remaining !== null && (
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${badgeColor}`}>
              {badgeLabel}
            </span>
            <span className="text-xs text-gray-500">
              {formatMessagesCount(remaining)} restants
            </span>
          </div>
        )}
      </header>

      {/* Zone de chat */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-3xl mx-auto h-full px-4">
          <ChatInterface
            userId={user.id}
            plan={plan}
            remaining={remaining}
          />
        </div>
      </div>
    </main>
  )
}
