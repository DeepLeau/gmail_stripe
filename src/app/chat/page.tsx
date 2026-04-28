import { ChatInterface } from '@/components/chat/ChatInterface'
import { UserMenu } from '@/components/ui/UserMenu'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface SubscriptionUsage {
  plan: string | null
  messages_used: number
  messages_limit: number | null
  reset_at: string | null
  subscription_id: string | null
}

export default async function ChatPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userEmail = user?.email ?? ''

  // Fetch subscription usage from the API
  let usage: SubscriptionUsage | null = null
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/subscription/usage`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    )
    if (res.ok) {
      usage = await res.json()
    }
  } catch {
    // Silently fail - ChatInterface will handle null usage
  }

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
            plan={usage?.plan ?? null}
            messagesUsed={usage?.messages_used ?? 0}
            messagesLimit={usage?.messages_limit ?? null}
            resetAt={usage?.reset_at ?? null}
            subscriptionId={usage?.subscription_id ?? null}
          />
        </div>
      </div>
    </main>
  )
}
