'use client'

import { useState, useEffect } from 'react'
import { X, Zap } from 'lucide-react'

const STORAGE_KEY = 'upgrade_prompt_dismissed'

export function UpgradePrompt() {
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (dismissed) {
      const dismissTime = parseInt(dismissed, 10)
      const now = Date.now()
      const dayInMs = 24 * 60 * 60 * 1000
      if (now - dismissTime < dayInMs) {
        setIsDismissed(true)
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem(STORAGE_KEY, Date.now().toString())
  }

  if (isDismissed) {
    return null
  }

  return (
    <div
      className="mx-6 mb-4 p-4 rounded-xl flex items-center gap-4"
      style={{
        backgroundColor: 'var(--accent-light)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: 'var(--accent)' }}
      >
        <Zap size={18} className="text-white" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
          Tu as atteint ta limite de messages
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>
          Passe à un plan supérieur pour continuer à utiliser Emind.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <a
          href="/#pricing"
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          style={{
            backgroundColor: 'var(--accent)',
            color: '#fff',
          }}
        >
          Voir les plans
        </a>
        <button
          onClick={handleDismiss}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--text-3)' }}
          aria-label="Fermer"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
