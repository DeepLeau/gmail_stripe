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

  // Fetch usage data from billing API
  let initialUsed = 0
  let initialLimit = 5
  let planName = 'free'

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/billing/get-usage`, {
      cache: 'no-store',
    })

    if (response.ok) {
      const data = await response.json()
      initialUsed = data.messagesUsed ?? 0
      initialLimit = data.messagesLimit ?? 5
      planName = data.planName ?? 'free'
    }
    // If 401, middleware handles it - we let the page render with defaults
    // If user has no plan, they get free plan defaults
  } catch {
    // On error (network, etc.), use free plan defaults
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
            initialUsed={initialUsed}
            initialLimit={initialLimit}
            planName={planName}
          />
        </div>
      </div>
    </main>
  )
}
