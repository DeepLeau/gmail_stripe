'use client'

import { Check } from 'lucide-react'

interface SignupPromptProps {
  sessionId: string | null
  planName: string | null
  messagesLimit: number | null
}

export function SignupPrompt({ sessionId, planName, messagesLimit }: SignupPromptProps) {
  if (!sessionId || !planName || !messagesLimit) {
    return null
  }

  return (
    <div
      className="mb-4 p-4 rounded-lg flex items-start gap-3"
      style={{
        backgroundColor: 'var(--accent-light)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
      }}
    >
      <Check
        size={18}
        className="mt-0.5 flex-shrink-0"
        strokeWidth={2.5}
        style={{ color: 'var(--accent)' }}
      />
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
          Tu as souscrit à <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{planName}</span>
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>
          {messagesLimit} messages/mois inclus avec ton plan
        </p>
      </div>
    </div>
  )
}
