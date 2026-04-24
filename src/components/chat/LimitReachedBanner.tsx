'use client'

import { useState } from 'react'
import { AlertTriangle, Loader2, Sparkles, ArrowRight } from 'lucide-react'

interface LimitReachedBannerProps {
  currentPlan: 'start' | 'scale' | 'team'
  limit: number
}

const planMessages = {
  start: {
    title: 'Start limit reached',
    description: "You've used all your messages for this billing period.",
    cta: 'Upgrade to Scale',
    targetPlan: 'scale',
  },
  scale: {
    title: 'Scale limit reached',
    description: "You've used all your messages for this billing period.",
    cta: 'Upgrade to Team',
    targetPlan: 'team',
  },
  team: {
    title: 'Team limit reached',
    description: "You've used all your messages for this billing period.",
    cta: 'Contact Sales',
    targetPlan: 'team',
  },
}

export function LimitReachedBanner({ currentPlan, limit }: LimitReachedBannerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const message = planMessages[currentPlan]

  const handleUpgrade = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: message.targetPlan,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const data = await response.json()
      window.location.href = data.url
    } catch {
      setError('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full p-4 bg-amber-50 border border-amber-200 rounded-xl">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-amber-900">{message.title}</h3>
          <p className="mt-1 text-sm text-amber-700">{message.description}</p>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 rounded-lg transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Redirecting...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{message.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
