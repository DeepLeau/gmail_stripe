import { ChatInterface } from '@/components/chat/ChatInterface'
import { UserMenu } from '@/components/ui/UserMenu'
import { getCurrentSubscription } from '@/app/actions/subscription'
import type { SubscriptionData } from '@/lib/stripe/config'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ChatPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userEmail = user?.email ?? ''

  const subscriptionState = await getCurrentSubscription()

  const subscription: SubscriptionData | null = subscriptionState
    ? {
        plan: subscriptionState.plan,
        units_used: subscriptionState.units_used,
        units_limit: subscriptionState.units_limit,
        units_remaining:
          subscriptionState.units_limit !== 0
            ? Math.max(0, subscriptionState.units_limit - subscriptionState.units_used)
            : null,
        status: subscriptionState.subscription_status,
      }
    : null

  const unitsLimit = subscription?.units_limit ?? null
  const unitsUsed = subscription?.units_used ?? 0
  const unitsRemaining =
    unitsLimit !== null && unitsLimit > 0 ? Math.max(0, unitsLimit - unitsUsed) : null

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
              status: subscription?.status ?? 'free',
            }}
          />
        </div>
      </div>
    </main>
  )
}
