'use client'

import { ChatInterface } from './ChatInterface'
import { UserMenu } from '@/components/ui/UserMenu'
import { PaymentBanner } from '@/components/payment/PaymentBanner'

interface Subscription {
  plan_id: string
  status: string
  current_period_end: string
}

interface Usage {
  messages_used: number
  messages_limit: number
  period_start: string
  period_end: string
}

interface ChatPageContentProps {
  userEmail: string
  subscription: Subscription | null
  usage: Usage | null
}

export function ChatPageContent({ userEmail, subscription, usage }: ChatPageContentProps) {
  const messagesUsed = usage?.messages_used ?? 0
  const messagesLimit = usage?.messages_limit ?? 0
  const hasReachedLimit = subscription && usage && messagesUsed >= messagesLimit
  const hasSubscription = !!subscription

  return (
    <main className="flex flex-col h-screen bg-white">
      {/* Payment banner - show if no subscription or limit reached */}
      {hasReachedLimit ? (
        <PaymentBanner variant="upgrade" />
      ) : !hasSubscription && userEmail ? (
        <PaymentBanner variant="success" />
      ) : null}

      {/* Header discret */}
      <header className="shrink-0 flex items-center justify-between h-14 px-4 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-900 tracking-tight">
          Emind
        </span>
        {userEmail && <UserMenu userEmail={userEmail} />}
      </header>

      {/* Zone de chat */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-3xl mx-auto h-full px-4">
          <ChatInterface
            hasSubscription={hasSubscription}
            messagesUsed={messagesUsed}
            messagesLimit={messagesLimit}
          />
        </div>
      </div>
    </main>
  )
}
