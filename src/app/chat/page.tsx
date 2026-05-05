export const dynamic = 'force-dynamic'

import { ChatInterface } from '@/components/chat/ChatInterface'
import { UserMenu } from '@/components/ui/UserMenu'
import { createClient } from '@/lib/supabase/server'
import { getCurrentSubscription } from '@/app/actions/subscription'

export default async function ChatPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const subscriptionState = user ? await getCurrentSubscription() : null

  const subscription =
    subscriptionState !== null
      ? {
          plan: subscriptionState.plan,
          units_limit: subscriptionState.units_limit,
          units_used: subscriptionState.units_used,
        }
      : null

  return (
    <main className="flex flex-col h-screen bg-white">
      {/* Header discret */}
      <header className="shrink-0 flex items-center justify-between h-14 px-6 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-900 tracking-tight">
          Emind
        </span>
        {user && <UserMenu userEmail={user.email ?? ''} plan={subscription?.plan ?? null} />}
      </header>

      {/* Zone de chat */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-3xl mx-auto h-full px-4">
          <ChatInterface subscription={subscription} />
        </div>
      </div>
    </main>
  )
}
