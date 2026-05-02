import { ChatInterface } from '@/components/chat/ChatInterface'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ChatPage() {
  let remaining = 0
  let plan = 'free'

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('units_limit, units_used, plan')
        .eq('user_id', user.id)
        .maybeSingle()

      if (subscription) {
        remaining = Math.max(0, (subscription.units_limit ?? 0) - (subscription.units_used ?? 0))
        plan = subscription.plan ?? 'free'
      }
    }
  } catch (err) {
    console.error('Failed to fetch subscription:', err)
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
          <ChatInterface remaining={remaining} plan={plan} />
        </div>
      </div>
    </main>
  )
}
