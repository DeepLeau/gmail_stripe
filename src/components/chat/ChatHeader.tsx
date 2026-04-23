interface ChatHeaderProps {
  plan: string
  messagesLimit: number
  messagesUsed: number
  subscriptionStatus: string
}

function isActive(status: string): boolean {
  return ['active', 'trialing'].includes(status)
}

function isLimitReached(messagesUsed: number, messagesLimit: number): boolean {
  return messagesLimit > 0 && messagesUsed >= messagesLimit
}

function formatPlan(plan: string): string {
  if (plan === 'free') return 'Free'
  return plan.charAt(0).toUpperCase() + plan.slice(1)
}

function getBadgeStyle(plan: string): string {
  if (plan === 'free') return 'bg-gray-100 text-gray-600'
  if (plan === 'starter') return 'bg-blue-50 text-blue-700'
  if (plan === 'team') return 'bg-purple-50 text-purple-700'
  return 'bg-orange-50 text-orange-700'
}

export function ChatHeader({
  plan,
  messagesLimit,
  messagesUsed,
  subscriptionStatus,
}: ChatHeaderProps) {
  if (!isActive(subscriptionStatus) || plan === 'free') {
    return null
  }

  const limitReached = isLimitReached(messagesUsed, messagesLimit)
  const remaining = messagesLimit - messagesUsed

  if (limitReached) {
    return (
      <a
        href="/pricing"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        Quota atteint · Upgrade
      </a>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getBadgeStyle(plan)}`}>
      {formatPlan(plan)} · {remaining}/{messagesLimit} msgs
    </span>
  )
}
