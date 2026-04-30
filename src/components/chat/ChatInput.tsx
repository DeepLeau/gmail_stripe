'use client'

import { useRef, useCallback, type ChangeEvent, type KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import Link from 'next/link'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isLoading: boolean
  disabled?: boolean
  remaining?: number | null
  onLimitReached?: () => void
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  disabled = false,
  remaining,
  onLimitReached,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isAtLimit = remaining !== null && remaining !== undefined && remaining <= 0

  const isDisabled = isLoading || disabled || isAtLimit || !value.trim()

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
      if (value.trim() && !isDisabled) {
        onSubmit()
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'
          textareaRef.current.style.overflowY = 'hidden'
        }
      }
    }
  }

  return (
    <div className="flex flex-col gap-2">
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
          placeholder={isAtLimit ? 'Limite atteinte' : 'Pose une question...'}
          rows={1}
          disabled={isLoading || isAtLimit || disabled}
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

      {isAtLimit && (
        <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-red-50 border border-red-200">
          <p className="text-xs text-red-600 font-medium">
            Limite de messages atteinte — Passez au plan supérieur
          </p>
          <Link
            href="/#pricing"
            className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline shrink-0"
          >
            Voir les plans
          </Link>
        </div>
      )}
    </div>
  )
}
