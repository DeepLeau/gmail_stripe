interface UsageMeterProps {
  used: number
  limit: number
}

export function UsageMeter({ used, limit }: UsageMeterProps) {
  const percentage = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0
  const isNearLimit = percentage >= 80

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-2)]">Messages utilisés</span>
        <span
          className="text-xs font-medium tabular-nums"
          style={{
            color: isNearLimit ? 'var(--amber)' : 'var(--text-2)',
          }}
        >
          {used}/{limit}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden bg-[var(--border)]">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: isNearLimit ? 'var(--amber)' : 'var(--accent)',
          }}
        />
      </div>
    </div>
  )
}
