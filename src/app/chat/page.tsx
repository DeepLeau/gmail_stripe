import { ChatInterface } from '@/components/chat/ChatInterface'
import { ChatHeader } from '@/components/chat/ChatHeader'
import { UserMenu } from '@/components/ui/UserMenu'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ChatPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userEmail = user?.email ?? ''

  // Fetch subscription data for ChatHeader
  const { data: subData } = await supabase.rpc('get_user_subscription', {
    p_user_id: user?.id ?? '00000000-0000-0000-0000-000000000000',
  })

  const plan = subData?.plan ?? 'free'
  const messagesLimit = subData?.messages_limit ?? 0
  const messagesUsed = subData?.messages_used ?? 0
  const subscriptionStatus = subData?.subscription_status ?? 'inactive'

  return (
    <main className="flex flex-col h-screen bg-white">
      {/* Header discret */}
      <header className="shrink-0 flex items-center justify-between h-14 px-4 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-900 tracking-tight">
          Emind
        </span>
        <div className="flex items-center gap-4">
          <ChatHeader
            plan={plan}
            messagesLimit={messagesLimit}
            messagesUsed={messagesUsed}
            subscriptionStatus={subscriptionStatus}
          />
          {userEmail && <UserMenu userEmail={userEmail} />}
        </div>
      </header>

      {/* Zone de chat */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-3xl mx-auto h-full px-4">
          <ChatInterface
            userId={user?.id ?? ''}
            plan={plan}
            messagesLimit={messagesLimit}
            messagesUsed={messagesUsed}
            subscriptionStatus={subscriptionStatus}
          />
        </div>
      </div>
    </main>
  )
}
