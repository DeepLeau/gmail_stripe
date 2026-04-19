import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'ghost' | 'plan-ghost' | 'plan-primary' | 'hero-primary' | 'hero-ghost'
type Size    = 'sm' | 'md' | 'lg' | 'hero' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  children: React.ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary: [
    'bg-gradient-to-br from-[var(--accent)] to-[#4F46E5]',
    'text-white',
    'shadow-[0_0_24px_rgba(99,102,241,0.35)]',
    'hover:shadow-[0_0_36px_rgba(99,102,241,0.55)]',
    'hover:-translate-y-px',
    'active:translate-y-0',
  ].join(' '),
  ghost: [
    'text-[var(--muted)]',
    'border border-[var(--glass-border)]',
    'bg-transparent',
    'hover:text-[var(--text)]',
    'hover:border-[rgba(99,102,241,0.4)]',
    'hover:bg-[var(--accent-light)]',
  ].join(' '),
  'plan-ghost': [
    'bg-[var(--glass-bg)]',
    'border border-[var(--glass-border)]',
    'text-[var(--text)]',
    'hover:border-[rgba(99,102,241,0.4)]',
    'hover:bg-[var(--accent-light)]',
  ].join(' '),
  'plan-primary': [
    'bg-gradient-to-br from-[var(--accent)] to-[#4338CA]',
    'text-white',
    'shadow-[0_8px_24px_rgba(99,102,241,0.4)]',
    'hover:shadow-[0_12px_32px_rgba(99,102,241,0.6)]',
    'hover:-translate-y-px',
  ].join(' '),
  'hero-primary': [
    // handled by CSS class .btn-hero-primary in globals.css
  ].join(' '),
  'hero-ghost': [
    // handled by CSS class .btn-hero-ghost in globals.css
  ].join(' '),
}

const sizeClasses: Record<Size, string> = {
  sm:   'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md:   'h-9 px-4 text-sm gap-2  rounded-lg',
  lg:   'h-10 px-5 text-sm gap-2 rounded-xl',
  hero: 'h-[52px] px-8 text-base gap-2 rounded-full min-w-[200px]',
  icon: 'h-8 w-8 p-0 rounded-lg',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }, ref) => {
    const isHero = variant === 'hero-primary' || variant === 'hero-ghost'

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Base styles — all buttons are centered flex
          'inline-flex items-center justify-center gap-2',
          'font-medium transition-all duration-150',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Hero buttons use CSS class names from globals.css
          isHero
            ? variant === 'hero-primary' ? 'btn-hero-primary' : 'btn-hero-ghost'
            : variantClasses[variant],
          !isHero && sizeClasses[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin shrink-0"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 004 4h4a4 4 0 014-4"
              />
            </svg>
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </button>
    )
  },
)

Button.displayName = 'Button'
