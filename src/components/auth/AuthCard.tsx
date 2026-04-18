import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface AuthCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function AuthCard({ title, subtitle, children, footer, className }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--bg)]">
      <div
        className={cn(
          'w-full max-w-sm',
          className
        )}
      >
        {/* Card */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 shadow-sm">
          {/* Header */}
          <div className="mb-7">
            <h1 className="text-lg font-semibold text-[var(--text)] tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-[var(--text-2)] mt-1 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form slot */}
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="mt-4 text-center">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
