'use client'

import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccordionItem {
  id: string
  title: string
  content: React.ReactNode
}

interface AccordionProps {
  items: AccordionItem[]
  defaultOpen?: string | null
  className?: string
  itemClassName?: string
  onChange?: (id: string | null) => void
}

export function Accordion({
  items,
  defaultOpen = null,
  className,
  itemClassName,
  onChange,
}: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpen)

  function handleToggle(id: string) {
    const next = openId === id ? null : id
    setOpenId(next)
    onChange?.(next)
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {items.map((item) => {
        const isOpen = openId === item.id
        return (
          <div
            key={item.id}
            className={cn(
              'border-2 border-[#2d3235] bg-white cursor-pointer',
              itemClassName
            )}
            style={{ boxShadow: '4px 4px 0px 0px #2d3235' }}
            onClick={() => handleToggle(item.id)}
          >
            <button
              className="w-full flex items-center justify-between px-5 py-4 text-left gap-3"
              aria-expanded={isOpen}
              aria-controls={`accordion-content-${item.id}`}
              id={`accordion-trigger-${item.id}`}
            >
              <span
                className="text-sm font-semibold flex-1"
                style={{
                  color: 'var(--neutral-text)',
                  fontFamily: 'Space Grotesk, sans-serif',
                }}
              >
                {item.title}
              </span>
              <ChevronDown
                size={16}
                strokeWidth={2}
                className={cn(
                  'flex-shrink-0 transition-transform duration-200',
                  isOpen && 'rotate-180'
                )}
                style={{ color: '#c24b46' }}
              />
            </button>

            <div
              id={`accordion-content-${item.id}`}
              role="region"
              aria-labelledby={`accordion-trigger-${item.id}`}
              className={cn('accordion-content')}
              style={{
                maxHeight: isOpen ? '400px' : '0px',
                opacity: isOpen ? 1 : 0,
              }}
            >
              <div
                className="px-5 pb-4 text-sm leading-relaxed"
                style={{ color: 'var(--neutral-text-muted)' }}
              >
                {item.content}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Convenience wrapper for FAQ-style accordion with checkmark bullets
export function AccordionWithChecks({
  items,
  defaultOpen = null,
}: {
  items: Array<{ title: string; checks: string[] }>
  defaultOpen?: string | null
}) {
  return (
    <Accordion
      items={items.map((item, i) => ({
        id: `faq-${i}`,
        title: item.title,
        content: (
          <ul className="flex flex-col gap-2">
            {item.checks.map((check, j) => (
              <li key={j} className="flex items-start gap-2">
                <Check size={14} className="flex-shrink-0 mt-0.5" style={{ color: '#1d8f6d' }} strokeWidth={2.5} />
                <span className="text-sm leading-relaxed" style={{ color: 'var(--neutral-text-muted)' }}>
                  {check}
                </span>
              </li>
            ))}
          </ul>
        ),
      }))}
      defaultOpen={defaultOpen}
    />
  )
}
