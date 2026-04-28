import { ChatInterface } from '@/components/chat/ChatInterface'
import { UserMenu } from '@/components/ui/UserMenu'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

async function fetchUsage(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/api/usage`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export default async function ChatPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userEmail = user?.email ?? ''

  const usageData = await fetchUsage(supabase)

  const subscription = usageData ?? {
    plan: 'no_plan',
    messagesUsed: 0,
    messagesLimit: null,
    isLimitReached: false,
  }

  const userPlan = usageData?.plan && usageData.plan !== 'no_plan' ? usageData.plan : undefined

  return (
    <main className="flex flex-col h-screen bg-white">
      {/* Header discret */}
      <header className="shrink-0 flex items-center justify-between h-14 px-4 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-900 tracking-tight">
          Emind
        </span>
        {userEmail && <UserMenu userEmail={userEmail} userPlan={userPlan} />}
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
