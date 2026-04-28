import { cookies } from 'next/headers'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { UserMenu } from '@/components/ui/UserMenu'
import { UsageMeter } from '@/components/chat'
import { UpgradeBanner } from '@/components/chat'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface UsageData {
  messagesUsed: number
  messagesLimit: number
  planName: string | null
  isLimitReached: boolean
  messagesRemaining: number
  renewsAt: string | null
}

async function getUsageData(): Promise<UsageData> {
  try {
    const cookieStore = await cookies()
    const supabaseCookies = cookieStore.getAll()

    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/api/stripe/usage`, {
      cache: 'no-store',
      headers: {
        Cookie: supabaseCookies.map((c) => `${c.name}=${c.value}`).join('; '),
      },
    })

    if (!res.ok) {
      return { messagesUsed: 0, messagesLimit: 100, planName: null, isLimitReached: false, messagesRemaining: 100, renewsAt: null }
    }

    const data = await res.json()
    return {
      messagesUsed: data.messagesUsed ?? 0,
      messagesLimit: data.messagesLimit ?? 100,
      planName: data.planName ?? null,
      isLimitReached: data.isLimitReached ?? false,
      messagesRemaining: data.messagesRemaining ?? 100,
      renewsAt: data.renewsAt ?? null,
    }
  } catch {
    return { messagesUsed: 0, messagesLimit: 100, planName: null, isLimitReached: false, messagesRemaining: 100, renewsAt: null }
  }
}

export default async function ChatPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userEmail = user?.email ?? ''
  const usageData = await getUsageData()

  return (
    <main className="flex flex-col h-screen bg-white">
      {/* Header discret */}
      <header className="shrink-0 flex items-center justify-between h-14 px-4 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-900 tracking-tight">
          Emind
        </span>
        <div className="flex items-center gap-3">
          <UsageMeter
            messagesUsed={usageData.messagesUsed}
            messagesLimit={usageData.messagesLimit}
            planName={usageData.planName}
          />
          {userEmail && <UserMenu userEmail={userEmail} />}
        </div>
      </header>

      {/* Zone de chat */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-3xl mx-auto h-full px-4">
          <ChatInterface />
        </div>
      </div>

      {/* Banner d'upgrade conditionnel */}
      {usageData.isLimitReached && (
        <UpgradeBanner />
      )}
    </main>
  )
}
