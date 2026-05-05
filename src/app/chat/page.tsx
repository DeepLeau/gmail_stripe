export const dynamic = 'force-dynamic'

import { ChatInterface } from '@/components/chat/ChatInterface'
import { createClient } from '@/lib/supabase/server'

export default async function ChatPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let plan: string | undefined
  let unitsLimit: number | undefined
  let unitsUsed: number | undefined

  if (user) {
    const { data: sub } = await supabase
      .from('user_subscriptions')
      .select('plan, units_limit, units_used')
      .eq('user_id', user.id)
      .eq('subscription_status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (sub) {
      plan = sub.plan ?? undefined
      unitsLimit = sub.units_limit ?? undefined
      unitsUsed = sub.units_used ?? undefined
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
            unitsLimit={unitsLimit}
            unitsUsed={unitsUsed}
          />
        </div>
      </div>
    </main>
  )
}
