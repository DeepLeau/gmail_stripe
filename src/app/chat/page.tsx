import { ChatInterface } from '@/components/chat/ChatInterface'
import { UserMenu } from '@/components/ui/UserMenu'
import { createClient } from '@/lib/supabase/server'
import type { StripePlanName } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

type SubscriptionInfo = {
  plan: StripePlanName
  remaining: number
  limit: number
  limitReached: boolean
}

async function getSubscriptionData(userId: string): Promise<SubscriptionInfo> {
  const supabase = await createClient()

  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('plan, messages_limit, messages_used')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()

  if (!subscription) {
    return {
      plan: 'start',
      remaining: 100,
      limit: 100,
      limitReached: false,
    }
  }

  const limit = subscription.messages_limit ?? 100
  const used = subscription.messages_used ?? 0
  const remaining = Math.max(0, limit - used)

  return {
    plan: (subscription.plan as StripePlanName) || 'start',
    remaining,
    limit,
    limitReached: remaining <= 0,
  }
}

export default async function ChatPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userEmail = user?.email ?? ''
  const subscription = user ? await getSubscriptionData(user.id) : null

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
          <ChatInterface subscription={subscription} />
        </div>
      </div>
    </main>
  )
}
