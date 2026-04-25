'use client'

import { PlanBadge } from '@/components/billing/PlanBadge'
import { UsageMeter } from '@/components/billing/UsageMeter'
import { UserMenu } from '@/components/ui/UserMenu'

interface UsageData {
  used: number
  limit: number
}

interface ChatHeaderProps {
  userEmail: string
  planName: string
  usageData: UsageData
}

export function ChatHeader({ userEmail, planName, usageData }: ChatHeaderProps) {
  return (
    <header className="shrink-0 flex items-center justify-between h-14 px-4 border-b border-gray-100">
      <span className="text-sm font-semibold text-gray-900 tracking-tight">
        Emind
      </span>

      <div className="flex items-center gap-3">
        <PlanBadge planId={planName} />
        <UsageMeter used={usageData.used} limit={usageData.limit} compact />
        {userEmail && <UserMenu userEmail={userEmail} />}
      </div>
    </header>
  )
}
