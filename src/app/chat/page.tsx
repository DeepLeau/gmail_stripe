import { ChatInterface } from '@/components/chat/ChatInterface'
import { UserMenu } from '@/components/ui/UserMenu'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface SubscriptionData {
  plan: string | null
  units_limit: number | null
  units_used: number
  subscription_status: string
  current_period_end: string | null
}

export default async function ChatPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userEmail = user?.email ?? ''

  // Fetch subscription data from user_subscriptions table
  let subscription: SubscriptionData | null = null
  if (user) {
    const { data: subData } = await supabase
      .from('user_subscriptions')
      .select('plan, units_limit, units_used, subscription_status, current_period_end')
      .eq('user_id', user.id)
      .single()

    if (subData) {
      subscription = {
        plan: subData.plan,
        units_limit: subData.units_limit,
        units_used: subData.units_used ?? 0,
        subscription_status: subData.subscription_status ?? 'free',
        current_period_end: subData.current_period_end?.toString() ?? null,
      }
    }
  }

  // Compute units_remaining
  const unitsLimit = subscription?.units_limit ?? null
  const unitsUsed = subscription?.units_used ?? 0
  const unitsRemaining =
    unitsLimit !== null ? Math.max(0, unitsLimit - unitsUsed) : null

  return (
    <main className="flex flex-col h-screen bg-white">
      {/* Header discret */}
      <header className="shrink-0 flex items-center justify-between h-14 px-4 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-900 tracking-tight">
          Emind
        </span>
        {userEmail && <UserMenu userEmail={userEmail} />}
      </header>

      {/* Zone de chat */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-3xl mx-auto h-full px-4">
          <ChatInterface
            subscription={{
              plan: subscription?.plan ?? null,
              units_used: unitsUsed,
              units_limit: unitsLimit,
              units_remaining: unitsRemaining,
              status: subscription?.subscription_status ?? 'free',
            }}
          />
        </div>
      </div>
    </main>
  )
}
