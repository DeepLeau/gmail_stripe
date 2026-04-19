'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedCounterProps {
  target: number
  decimals?: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}

export function AnimatedCounter({
  target,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 2400,
  className = '',
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          const start = performance.now()

          const animate = (currentTime: number) => {
            const elapsed = currentTime - start
            const progress = Math.min(elapsed / duration, 1)
            const easeProgress = 1 - Math.pow(1 - progress, 3)
            const currentVal = target * easeProgress

            if (decimals > 0) {
              setCount(parseFloat(currentVal.toFixed(decimals)))
            } else {
              setCount(Math.round(currentVal))
            }

            if (progress < 1) {
              requestAnimationFrame(animate)
            } else {
              setCount(target)
            }
          }

          requestAnimationFrame(animate)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [target, duration, decimals, hasAnimated])

  const formatted =
    decimals > 0
      ? count.toFixed(decimals)
      : count.toLocaleString('fr-FR')

  return (
    <span ref={ref} className={`counter-value ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
