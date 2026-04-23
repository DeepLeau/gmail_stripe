import { ChatInterface } from '@/components/chat/ChatInterface'
import { UserMenu } from '@/components/ui/UserMenu'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ChatPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userEmail = user?.email ?? ''

  // Fetch subscription data for UserMenu badge
  let plan = 'Free'
  let remaining = 0
  let messagesLimit = 100

  if (user) {
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('plan, messages_limit, messages_used')
      .maybeSingle()

    if (subscription) {
      plan = subscription.plan ?? 'Free'
      messagesLimit = subscription.messages_limit ?? 100
      const messagesUsed = subscription.messages_used ?? 0
      remaining = Math.max(0, messagesLimit - messagesUsed)
    }
  }

  return (
    <main className="flex flex-col h-screen bg-white">
      {/* Header discret */}
      <header className="shrink-0 flex items-center justify-between h-14 px-4 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-900 tracking-tight">
          Emind
        </span>
        {userEmail && (
          <UserMenu
            userEmail={userEmail}
            plan={plan}
            remaining={remaining}
            messagesLimit={messagesLimit}
          />
        )}
      </header>

      {/* Zone de chat */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-3xl mx-auto h-full px-4">
          <ChatInterface />
        </div>
      </div>
    </main>
  )
}
