'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { Variants } from 'framer-motion'

interface LoadingButtonProps {
  onClick: () => Promise<void>
  children: React.ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  disabled?: boolean
}

export function LoadingButton({
  onClick,
  children,
  className = '',
  variant = 'primary',
  disabled = false,
}: LoadingButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    if (loading || disabled) return
    setLoading(true)
    setError(null)
    try {
      await onClick()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const baseClasses =
    'relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 font-mono text-xs font-semibold uppercase tracking-[0.1em]'

  const variantClasses = {
    primary: `bg-gradient-to-b from-[var(--accent)] to-[var(--accent-dark)]
      text-graphite-900
      shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_10px_var(--accent-glow)]
      hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_8px_24px_var(--accent-glow)]`,
    secondary: `bg-graphite-900 text-canvas
      shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_16px_rgba(14,15,17,0.15)]
      hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_28px_rgba(14,15,17,0.25)]`,
    ghost: `bg-transparent text-graphite-900 border border-graphite-900/10
      shadow-[0_2px_8px_rgba(14,15,17,0.04)]
      hover:shadow-[0_8px_20px_rgba(14,15,17,0.08)] hover:border-graphite-900/20`,
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleClick}
        disabled={loading || disabled}
        className={`${baseClasses} ${variantClasses[variant]} ${className}
          disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
      >
        {loading && (
          <Loader2
            size={14}
            className="mr-2 shrink-0 animate-spin"
            strokeWidth={2}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          {loading ? 'Redirection...' : children}
        </span>
        {variant === 'primary' && (
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-swiss" />
        )}
      </button>
      {error && (
        <p className="text-xs text-[var(--red)] font-mono">{error}</p>
      )}
    </div>
  )
}
