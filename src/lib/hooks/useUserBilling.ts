'use client'

import { useState, useEffect, useCallback } from 'react'

export type BillingData = {
  plan: string
  messages_limit: number
  messages_used: number
  messages_remaining: number
  period_end: string | null
}

export function useUserBilling() {
  const [data, setData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBilling = useCallback(async () => {
    try {
      const res = await fetch('/api/user/billing')
      if (!res.ok) throw new Error('fetch failed')
      const json: BillingData = await res.json()
      setData(json)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchBilling()
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [fetchBilling])

  return { data, loading, error, refetch: fetchBilling }
}
