import { ChatInterface } from '@/components/chat/ChatInterface'
import { UserMenu } from '@/components/ui/UserMenu'
import { createClient } from '@/lib/supabase/server'
import type { SubscriptionData } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

interface ChatPageProps {
  searchParams: Promise<Record<string, string>>
}

export default async function ChatPage({ searchParams: _searchParams }: ChatPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userEmail = user?.email ?? ''

  // Fetch subscription data from API
  let subscription: SubscriptionData | null = null
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/subscription`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    })
    if (res.ok) {
      subscription = await res.json()
    }
  } catch {
    // Silent fallback — treat as free/no subscription
  }

  const planName = subscription?.plan ?? 'Free'
  const messagesUsed = subscription?.messages_used ?? 0
  const messagesLimit = subscription?.messages_limit ?? null
  const isSubscriber = Boolean(subscription?.status && subscription.status !== 'free')

  const planDisplay = isSubscriber && messagesLimit !== null
    ? `${planName} · ${messagesUsed}/${messagesLimit} messages`
    : 'Free'

  return (
    <main className="flex flex-col h-screen bg-white">
      {/* Header discret */}
      <header className="shrink-0 flex items-center justify-between h-14 px-4 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-900 tracking-tight">
          Emind
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 tabular-nums">
            {planDisplay}
          </span>
          <UserMenu
            userEmail={userEmail}
            plan={isSubscriber ? {
              name: planName,
              messages_used: messagesUsed,
              messages_limit: messagesLimit,
            } : undefined}
          />
        </div>
      </header>

      {/* Zone de chat */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-3xl mx-auto h-full px-4">
          <ChatInterface
            plan={planName}
            messages_limit={subscription?.messages_limit ?? null}
            messages_used={subscription?.messages_used ?? 0}
            messages_remaining={subscription?.messages_remaining ?? null}
            status={subscription?.status ?? 'free'}
          />
        </div>
      </div>
    </main>
  )
}
