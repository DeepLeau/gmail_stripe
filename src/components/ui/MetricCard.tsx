import { cn } from '@/lib/utils'
import { TrendingUp } from 'lucide-react'

interface MetricCardProps {
  value: string | number
  label: string
  sublabel?: string
  sparkData?: number[]
  trend?: string
  trendUp?: boolean
  suffix?: string
  className?: string
}

export function MetricCard({
  value,
  label,
  sublabel,
  sparkData = [],
  trend,
  trendUp = true,
  suffix,
  className,
}: MetricCardProps) {
  const maxSpark = sparkData.length > 0 ? Math.max(...sparkData) : 1

  return (
    <div className={cn('metric', className)}>
      {/* Value */}
      <div className="metric__value">
        {value}
        {suffix && <span className="metric__suffix">{suffix}</span>}
      </div>

      {/* Label */}
      <p className="metric__label">{label}</p>

      {/* Sublabel */}
      {sublabel && (
        <p className="metric__sub">{sublabel}</p>
      )}

      {/* Sparkline */}
      {sparkData.length > 0 && (
        <div className="metric__sparkline">
          {sparkData.map((v, i) => (
            <div
              key={i}
              className="metric__spark-bar"
              style={{
                height: `${(v / maxSpark) * 100}%`,
                animationDelay: `${i * 0.06}s`,
                background: i === sparkData.length - 1
                  ? 'linear-gradient(to top, rgba(99,102,241,0.5), rgba(165,180,252,0.7))'
                  : undefined,
              }}
            />
          ))}
        </div>
      )}

      {/* Trend */}
      {trend && (
        <div className={cn('metric__trend', trendUp ? 'metric__trend--up' : 'metric__trend--down')}>
          <TrendingUp size={11} strokeWidth={1.5} />
          <span>{trend}</span>
        </div>
      )}
    </div>
  )
}
