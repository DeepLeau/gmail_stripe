import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'
import type { InputHTMLAttributes } from 'react'

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function AuthInput({ label, error, id, ...props }: AuthInputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-[var(--text-2)]"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={cn(
          'h-10 px-3 rounded-lg text-sm transition-colors duration-150',
          'bg-[var(--bg)] border',
          'text-[var(--text)] placeholder:text-[var(--text-3)]',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          error
            ? 'border-[var(--red)] focus:border-[var(--red)] focus:ring-[var(--red)]/15'
            : 'border-[var(--border-md)] focus:border-[var(--accent)] focus:ring-[var(--accent)]/15'
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-[var(--red)] flex items-center gap-1">
          <AlertCircle size={11} strokeWidth={1.5} className="shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}
