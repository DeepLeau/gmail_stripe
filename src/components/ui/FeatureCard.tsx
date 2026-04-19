import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  badge?: string
  badgeVariant?: 'ok' | 'warn' | 'info'
  children?: React.ReactNode
  variant?: 'wide' | 'tall' | 'full' | 'regular'
  className?: string
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  badge,
  badgeVariant = 'ok',
  children,
  variant = 'regular',
  className,
}: FeatureCardProps) {
  const variantClass = {
    wide:    'feature-card--wide',
    tall:    'feature-card--tall',
    full:    'feature-card--full',
    regular: '',
  }[variant]

  const badgeClass = {
    ok:   'feature-status',
    warn: 'feature-status feature-status--warn',
    info: 'feature-status feature-status--info',
  }[badgeVariant]

  return (
    <div className={cn('feature-card', variantClass, className)}>
      {/* Mouse glow layer */}
      <div className="feature-card__glow" />

      {/* Status badge */}
      {badge && (
        <div className={badgeClass}>
          <span className="feature-status__dot" />
          {badge}
        </div>
      )}

      {/* Icon */}
      <div className="feature-card__icon">
        <Icon size={22} strokeWidth={1.5} />
      </div>

      {/* Content */}
      <h3 className="feature-card__title">{title}</h3>
      <p className="feature-card__body">{description}</p>

      {/* Optional visual slot */}
      {children && (
        <div className="feature-card__visual">{children}</div>
      )}
    </div>
  )
}
