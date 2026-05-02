export const dynamic = 'force-dynamic'

import { ChatInterface } from '@/components/chat/ChatInterface'
import { createClient } from '@/lib/supabase/server'

// Fetch subscription data server-side
async function getSubscriptionData() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { remaining: null, plan: null }
  }

  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('plan, units_limit, units_used, subscription_status')
    .eq('user_id', user.id)
    .single()

  if (!subscription) {
    return { remaining: null, plan: null }
  }

  const remaining =
    subscription.units_limit !== null
      ? Math.max(0, subscription.units_limit - subscription.units_used)
      : null

  return {
    remaining,
    plan: subscription.plan,
  }
}

export default async function ChatPage() {
  const { remaining, plan } = await getSubscriptionData()

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
          <ChatInterface remaining={remaining} plan={plan} />
        </div>
      </div>
    </main>
  )
}
