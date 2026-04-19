'use client'

import { useEffect, useRef } from 'react'

interface TickerItem {
  label: string
  value: string
}

const TICKER_ITEMS: TickerItem[] = [
  { label: 'MESSAGES', value: '48,2k' },
  { label: 'CONVERSATIONS', value: '12,8k' },
  { label: 'UTILISATEURS', value: '3,4k' },
  { label: 'RÉPONSES', value: '91,3k' },
  { label: 'QUOTA UTILISÉ', value: '74%' },
  { label: 'EN LIGNE', value: '1,2k' },
]

export function Ticker() {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    // Pause on hover
    const handleEnter = () => track.classList.add('animate-ticker')
    const handleLeave = () => track.classList.remove('animate-ticker')

    // Force animation running initially
    track.classList.add('animate-ticker')

    return () => {
      track.removeEventListener('mouseenter', handleEnter)
      track.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  // Duplicate items for seamless loop
  const allItems = [...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <div
      className="fixed bottom-0 left-0 w-full h-[36px] z-[9997] overflow-hidden items-center pointer-events-none border-t border-white/10 hidden md:flex"
      style={{ backgroundColor: 'var(--graphite-900)' }}
      aria-hidden="true"
    >
      <div className="flex whitespace-nowrap" ref={trackRef}>
        {allItems.map((item, i) => (
          <span
            key={i}
            className="mx-4 font-mono text-xs text-canvas tracking-[0.06em]"
          >
            {item.label}
            <span className="text-amber ml-1">{item.value}</span>
            {' // '}
          </span>
        ))}
      </div>
    </div>
  )
}
