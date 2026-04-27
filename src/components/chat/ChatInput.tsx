'use client'

import { useRef, useCallback, type ChangeEvent, type KeyboardEvent } from 'react'
import { Send } from 'lucide-react'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isLoading: boolean
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  disabled = false,
  placeholder = 'Pose une question...',
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
      if (value.trim() && !isLoading && !disabled) {
        onSubmit()
        // Reset textarea après envoi
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'
          textareaRef.current.style.overflowY = 'hidden'
        }
      }
    }
  }

  const isDisabled = isLoading || disabled

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!isDisabled && value.trim()) onSubmit()
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'
          textareaRef.current.style.overflowY = 'hidden'
        }
      }}
      className={`flex items-end gap-3 border rounded-2xl px-4 py-3 shadow-sm transition-colors duration-150 ${
        disabled
          ? 'bg-gray-50 border-gray-200'
          : 'bg-white border-gray-200'
      }`}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        disabled={isDisabled}
        className={`flex-1 text-sm resize-none focus:outline-none min-h-[24px] transition-colors duration-150 ${
          disabled
            ? 'bg-transparent text-gray-400 placeholder:text-gray-300 cursor-not-allowed'
            : 'bg-transparent text-gray-900 placeholder:text-gray-400'
        }`}
        style={{
          height: 'auto',
          overflowY: 'hidden',
          lineHeight: '24px',
        }}
      />

      <button
        type="submit"
        disabled={isDisabled || !value.trim()}
        className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-150 disabled:cursor-not-allowed ${
          disabled || !value.trim()
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
        aria-label="Envoyer"
      >
        <Send size={15} className="text-white" strokeWidth={2} />
      </button>
    </form>
  )
}
