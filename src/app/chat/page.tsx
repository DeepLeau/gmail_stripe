import { ChatInterface } from '@/components/chat/ChatInterface'
import { createClient } from '@/lib/supabase/server'

interface UserSubscription {
  plan: string | null
  units_used: number
  units_limit: number | null
  subscription_status: string | null
}

export default async function ChatPage() {
  let remaining: number | undefined
  let planName: string | null = null

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('plan, units_used, units_limit, subscription_status')
        .eq('user_id', user.id)
        .single<UserSubscription>()

      if (subscription && subscription.units_limit !== null) {
        remaining = Math.max(0, subscription.units_limit - subscription.units_used)
        planName = subscription.plan
      }
    }
  } catch {
    // Fail silently - chat still works without subscription info
  }

  return (
    <main className="flex flex-col h-screen bg-white">
      {/* Header discret */}
      <header className="shrink-0 flex items-center justify-between h-14 border-b border-gray-100 px-4">
        <span className="text-sm font-semibold text-gray-900 tracking-tight">
          Emind
        </span>
        {planName && remaining !== undefined && (
          <span className="text-xs text-gray-500">
            {planName.charAt(0).toUpperCase() + planName.slice(1)} — {remaining} messages restants
          </span>
        )}
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
