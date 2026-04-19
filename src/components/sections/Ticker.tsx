export function Ticker() {
  const items = [
    { label: 'CONVERSATIONS', value: '1 240' },
    { label: 'INSIGHTS', value: '847' },
    { label: 'RÉPONSES', value: '3 102' },
    { label: 'LEADS', value: '284' },
    { label: 'THREADS', value: '5 901' },
  ]

  // Duplicate for seamless loop
  const doubled = [...items, ...items]

  return (
    <div
      className="fixed bottom-0 left-0 w-full h-[36px] bg-graphite-900 z-[9997] overflow-hidden items-center pointer-events-none border-t border-white/10 hidden md:flex"
      aria-hidden="true"
    >
      <div className="flex whitespace-nowrap animate-ticker font-mono text-xs text-canvas tracking-[0.06em]">
        {doubled.map((item, i) => (
          <span key={i} className="mx-4">
            {item.label}{' '}
            <span className="text-amber">{item.value}</span>{' '}
            //
          </span>
        ))}
      </div>
    </div>
  )
}
