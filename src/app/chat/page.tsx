import { ChatInterface } from '@/components/chat/ChatInterface'
import { getCurrentSubscription } from '@/app/actions/subscription'
import { STRIPE_PLANS } from '@/lib/stripe/config'

export default async function ChatPage() {
  const subscriptionState = await getCurrentSubscription()

  const planSlug = subscriptionState?.plan ?? null
  const unitsUsed = subscriptionState?.units_used ?? 0
  const unitsLimit = subscriptionState?.units_limit ?? 0
  const remaining = unitsLimit > 0 ? Math.max(0, unitsLimit - unitsUsed) : 0

  // Resolve plan display name
  let planLabel = ''
  if (planSlug && planSlug in STRIPE_PLANS) {
    planLabel = STRIPE_PLANS[planSlug as keyof typeof STRIPE_PLANS].displayName
  }

  const headerLabel =
    planLabel && remaining > 0
      ? `Plan ${planLabel} · ${remaining} message${remaining !== 1 ? 's' : ''} restant${remaining !== 1 ? 's' : ''}`
      : planLabel
      ? `Plan ${planLabel}`
      : ''

  return (
    <main className="flex flex-col h-screen bg-white">
      {/* Header discret */}
      <header className="shrink-0 flex items-center justify-between h-14 border-b border-gray-100 px-4">
        <span className="text-sm font-semibold text-gray-900 tracking-tight">
          Emind
        </span>
        {headerLabel && (
          <span className="text-xs text-gray-500">{headerLabel}</span>
        )}
      </header>

      {/* Zone de chat */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-3xl mx-auto h-full px-4">
          <ChatInterface plan={planSlug} remaining={remaining} />
        </div>
      </div>
    </main>
  )
}
