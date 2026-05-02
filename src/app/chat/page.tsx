export const dynamic = 'force-dynamic'

import { ChatInterface } from '@/components/chat/ChatInterface'
import { createClient } from '@/lib/supabase/server'

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let plan: string | null = null
  let unitsUsed = 0
  let unitsLimit: number | null = null
  let remaining: number | null = null

  if (user) {
    const { data: sub } = await supabase
      .from('user_subscriptions')
      .select('plan, units_used, units_limit')
      .eq('user_id', user.id)
      .single()

    if (sub) {
      plan = sub.plan ?? null
      unitsUsed = sub.units_used ?? 0
      unitsLimit = sub.units_limit ?? null
      remaining = unitsLimit !== null ? Math.max(0, unitsLimit - unitsUsed) : null
    }
  }

  return (
    <main className="flex flex-col h-screen bg-white">
      {/* Header discret */}
      <header className="shrink-0 flex items-center justify-center h-14 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-900 tracking-tight">
          Emind
        </span>
      </header>

      {/* Zone de chat */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-3xl mx-auto h-full px-4">
          <ChatInterface
            plan={plan}
            remaining={remaining}
            unitsLimit={unitsLimit}
          />
        </div>
      </div>
    </main>
  )
}
