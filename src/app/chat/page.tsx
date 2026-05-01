export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { getCurrentSubscription } from '@/app/actions/subscription'
import type { SubscriptionData } from '@/lib/stripe/config'

export default async function ChatPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const subscriptionState = await getCurrentSubscription()

  // Adapt SubscriptionState → SubscriptionData (calcul de remaining côté serveur)
  const subscription: SubscriptionData | null = subscriptionState
    ? {
        plan: subscriptionState.plan,
        units_used: subscriptionState.units_used,
        units_limit: subscriptionState.units_limit,
        units_remaining:
          subscriptionState.units_limit !== null
            ? Math.max(0, subscriptionState.units_limit - subscriptionState.units_used)
            : null,
        status: subscriptionState.subscription_status,
      }
    : null

  return (
    <main className="flex flex-col h-screen bg-white">
      {/* Header discret */}
      <header className="shrink-0 flex items-center justify-center h-14 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-900 tracking-tight">Emind</span>
      </header>

      {/* Zone de chat */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-3xl mx-auto h-full px-4">
          <ChatInterface
            remaining={subscription?.units_remaining ?? null}
            plan={subscription?.plan ?? null}
          />
        </div>
      </div>
    </main>
  )
}
