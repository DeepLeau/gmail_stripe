'use client'

import { useRef, useCallback, type ChangeEvent, type KeyboardEvent } from 'react'
import { Send, AlertCircle } from 'lucide-react'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isLoading: boolean
  remaining?: number | null
}

export function ChatInput({ value, onChange, onSubmit, isLoading, remaining }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isLimitReached = remaining != null && remaining <= 0

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    const lineHeight = 24
    const maxLines = 5
    const maxHeight = lineHeight * maxLines

    if (textarea.scrollHeight > maxHeight) {
      textarea.style.height = `${maxHeight}px`
      textarea.style.overflowY = 'auto'
    } else {
      textarea.style.height = `${textarea.scrollHeight}px`
      textarea.style.overflowY = 'hidden'
    }
  }, [])

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
    adjustHeight()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim() && !isLoading && !isLimitReached) {
        onSubmit()
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'
          textareaRef.current.style.overflowY = 'hidden'
        }
      }
    }
  }

  const isDisabled = isLoading || !value.trim() || isLimitReached

  return (
    <div className="flex flex-col gap-3">
      {/* Bannière limite atteinte */}
      {isLimitReached && (
        <div
          className="flex items-center justify-between gap-3 py-3 px-4 rounded-xl"
          style={{
            backgroundColor: 'var(--yellow-light, #FEF3C7)',
            border: '1px solid var(--yellow-border, #FCD34D)',
          }}
        >
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text)' }}>
            <AlertCircle size={16} style={{ color: 'var(--yellow-dark, #B45309)' }} />
            <span>Limite de messages atteinte</span>
          </div>
          <a
            href="/#pricing"
            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--accent)',
              color: '#fff',
            }}
          >
            Upgrade
          </a>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!isDisabled) onSubmit()
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.overflowY = 'hidden'
          }
        }}
        className="flex items-end gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm"
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={isLimitReached ? 'Limite atteinte — upgrade pour continuer' : 'Pose une question...'}
          rows={1}
          disabled={isLoading || isLimitReached}
          className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none disabled:cursor-not-allowed min-h-[24px]"
          style={{
            height: 'auto',
            overflowY: 'hidden',
            lineHeight: '24px',
          }}
        />

        <button
          type="submit"
          disabled={isDisabled}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-150"
          aria-label="Envoyer"
        >
          <Send size={15} className="text-white" strokeWidth={2} />
        </button>
      </form>
    </div>
  )
}
