import { ChatInterface } from '@/components/chat/ChatInterface'
import { UserMenu } from '@/components/ui/UserMenu'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface SubscriptionData {
  plan: string
  messagesLimit: number
  messagesRemaining: number
  status: string
  periodEnd?: string
}

async function getSubscription(): Promise<SubscriptionData | null> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    // Fetch from API route with server cookies
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/subscription`, {
      cache: 'no-store',
      credentials: 'include',
    })

    if (!response.ok) {
      if (response.status === 401) {
        return null
      }
      // Return default values on error
      return {
        plan: 'free',
        messagesLimit: 100,
        messagesRemaining: 100,
        status: 'active',
      }
    }

    return response.json()
  } catch {
    // Return default values on any error
    return {
      plan: 'free',
      messagesLimit: 100,
      messagesRemaining: 100,
      status: 'active',
    }
  }
}

export default async function ChatPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userEmail = user?.email ?? ''
  const subscription = await getSubscription()

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
            initialPlan={subscription?.plan ?? 'free'}
            initialMessagesLimit={subscription?.messagesLimit ?? 100}
            initialMessagesRemaining={subscription?.messagesRemaining ?? 100}
          />
        </div>
      </div>
    </main>
  )
}
