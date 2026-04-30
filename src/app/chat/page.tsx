export const dynamic = 'force-dynamic'

import { ChatInterface } from '@/components/chat/ChatInterface'
import { createClient } from '@/lib/supabase/server'
import { getCurrentSubscription } from '@/app/actions/subscription'

export default async function ChatPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const subscriptionState = await getCurrentSubscription()

  const quota = {
    plan: subscriptionState?.plan ?? null,
    limit: subscriptionState?.units_limit ?? 0,
    remaining:
      subscriptionState?.units_limit !== null && subscriptionState?.units_limit !== undefined
        ? Math.max(0, subscriptionState.units_limit - (subscriptionState.units_used ?? 0))
        : 0,
  }

  return (
    <main className="flex flex-col h-screen bg-white">
      <header className="shrink-0 flex items-center justify-center h-14 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-900 tracking-tight">
          Emind
        </span>
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="max-w-3xl mx-auto h-full px-4">
          <ChatInterface plan={quota.plan} remaining={quota.remaining} limit={quota.limit} />
        </div>
      </div>
    </main>
  )
}
