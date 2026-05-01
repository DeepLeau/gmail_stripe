import { ChatInterface } from '@/components/chat/ChatInterface'
import { getCurrentSubscription } from '@/app/actions/subscription'

export default async function ChatPage() {
  const subscriptionState = await getCurrentSubscription()

  const plan = subscriptionState?.plan ?? 'free'
  const messagesLimit = subscriptionState?.units_limit ?? 0
  const messagesUsed = subscriptionState?.units_used ?? 0
  const remaining = messagesLimit > 0 ? Math.max(0, messagesLimit - messagesUsed) : 0

  return (
    <main className="flex flex-col h-screen bg-white">
      {/* Header discret */}
      <header className="shrink-0 flex items-center justify-between h-14 px-4 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-900 tracking-tight">
          Emind
        </span>
        {remaining > 0 && messagesLimit > 0 && (
          <span className="text-xs text-gray-400">
            {remaining} / {messagesLimit} messages restants
          </span>
        )}
      </header>

      {/* Zone de chat */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-3xl mx-auto h-full px-4">
          <ChatInterface
            plan={plan}
            remaining={remaining}
            messagesLimit={messagesLimit}
          />
        </div>
      </div>
    </main>
  )
}
