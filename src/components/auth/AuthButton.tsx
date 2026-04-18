import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function AuthButton({
  children,
  loading = false,
  variant = 'primary',
  disabled,
  className,
  ...props
}: AuthButtonProps) {
  const base =
    'h-10 px-4 flex items-center justify-center rounded-lg text-sm font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-[var(--accent)] hover:bg-[var(--accent-hi)] text-white shadow-sm',
    secondary:
      'border border-[var(--border-md)] bg-transparent hover:bg-[var(--surface-2)] text-[var(--text)]',
    ghost: 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface)]',
  }

  return (
    <button
      disabled={disabled || loading}
      className={cn(base, variants[variant], className)}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={14} className="animate-spin shrink-0" strokeWidth={2} />
          <span>Chargement...</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
