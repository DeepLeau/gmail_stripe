'use client'

import { createContext, useContext, type ReactNode } from 'react'

interface SubscriptionInfo {
  plan: string | null
  units_used: number
  units_limit: number | null
  units_remaining: number | null
  status: string
}

type SubscriptionContextValue = SubscriptionInfo | null

const SubscriptionContext = createContext<SubscriptionContextValue>(null)

export function useSubscription(): SubscriptionContextValue {
  return useContext(SubscriptionContext)
}

interface SubscriptionProviderProps {
  subscription: SubscriptionInfo | null
  children: ReactNode
}

export function SubscriptionProvider({
  subscription,
  children,
}: SubscriptionProviderProps) {
  return (
    <SubscriptionContext.Provider value={subscription}>
      {children}
    </SubscriptionContext.Provider>
  )
}
