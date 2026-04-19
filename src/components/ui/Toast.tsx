'use client'

import { useEffect, useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ToastProps {
  message: string
  type?: 'error' | 'success' | 'warning'
  visible: boolean
  onClose: () => void
  duration?: number
}

export function Toast({ message, type = 'error', visible, onClose, duration = 4000 }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (visible && !isExiting) {
      const timer = setTimeout(() => {
        setIsExiting(true)
        setTimeout(onClose, 300)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [visible, duration, onClose, isExiting])

  if (!visible) return null

  const bgColor = type === 'error' ? '#c24b46' : type === 'success' ? '#1d8f6d' : '#d67035'

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 shadow-[4px_4px_0px_0px_#2d3235] min-w-[280px] max-w-[380px]',
        isExiting ? 'toast-exit' : 'toast-enter'
      )}
      style={{
        backgroundColor: '#ffffff',
        border: '2px solid #2d3235',
      }}
      role="alert"
      aria-live="assertive"
    >
      {/* Icon */}
      <div
        className="w-8 h-8 flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: bgColor }}
      >
        {type === 'error' && <X size={14} className="text-white" strokeWidth={2.5} />}
        {type === 'warning' && <AlertTriangle size={14} className="text-white" strokeWidth={2.5} />}
        {type === 'success' && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>

      {/* Message */}
      <p
        className="flex-1 text-sm font-medium"
        style={{ color: '#2d3235', fontFamily: 'JetBrains Mono, monospace' }}
      >
        {message}
      </p>

      {/* Close */}
      <button
        onClick={() => {
          setIsExiting(true)
          setTimeout(onClose, 300)
        }}
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center hover:bg-gray-100 transition-colors"
        aria-label="Fermer la notification"
      >
        <X size={12} style={{ color: '#5a5f63' }} strokeWidth={2} />
      </button>
    </div>
  )
}
