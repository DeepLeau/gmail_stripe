export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChatInterface } from '@/components/chat/ChatInterface'

export default async function ChatPage() {
  let supabase
  try {
    supabase = await createClient()
  } catch {
    // Env vars absentes au build — on redirige vers login au runtime
    redirect('/login')
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('plan, units_limit, units_used')
    .eq('user_id', user.id)
    .eq('subscription_status', 'active')
    .maybeSingle()

  if (!subscription) {
    redirect('/#pricing')
  }

  const remaining = Math.max(0, (subscription.units_limit ?? 0) - (subscription.units_used ?? 0))

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
          <ChatInterface remaining={remaining} />
        </div>
      </div>
    </main>
  )
}
