export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { redirect } from 'next/navigation'

export default async function ChatPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Load subscription data for quota display
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('plan, units_limit, units_used, subscription_status')
    .eq('user_id', user.id)
    .maybeSingle()

  const unitsLimit = subscription?.units_limit ?? 0
  const unitsUsed = subscription?.units_used ?? 0
  const remaining = unitsLimit - unitsUsed

  return (
    <main className="flex flex-col h-screen bg-white">
      {/* Header discret */}
      <header className="shrink-0 flex items-center justify-center h-14 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-900 tracking-tight">
          Emind
        </span>
      </header>

      {/* Zone de chat */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-3xl mx-auto h-full px-4">
          <ChatInterface
            remaining={remaining}
            plan={subscription?.plan ?? null}
            subscriptionStatus={subscription?.subscription_status ?? null}
          />
        </div>
      </div>
    </main>
  )
}
