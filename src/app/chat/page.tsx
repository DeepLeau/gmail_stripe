import { ChatInterface } from '@/components/chat/ChatInterface'
import { UserMenu } from '@/components/ui/UserMenu'
import { PlanBadge } from '@/components/ui/PlanBadge'
import { createClient } from '@/lib/supabase/server'
import type { SubscriptionData } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

export default async function ChatPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userEmail = user?.email ?? ''

  // Fetch subscription server-side
  let subscription: SubscriptionData | null = null
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/subscription`,
      { cache: 'no-store' }
    )
    if (res.ok) {
      subscription = await res.json()
    }
  } catch {
    // Non connecté ou erreur — subscription reste null
  }

  return (
    <main className="flex flex-col h-screen bg-white">
      {/* Header discret */}
      <header className="shrink-0 flex items-center justify-between h-14 px-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-900 tracking-tight">Emind</span>
          {subscription && <PlanBadge plan={subscription.plan ?? null} />}
        </div>
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
