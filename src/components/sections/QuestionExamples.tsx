'use client'

import { useEffect, useRef } from 'react'
import { questionPairs, type QuestionPair } from '@/lib/data'
import { MessageCircle } from 'lucide-react'

function QuestionBubble({ pair, index }: { pair: QuestionPair; index: number }) {
  return (
    <div
      className="flex flex-col gap-3 animate-in"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Question bubble (right) */}
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[var(--text-3)]">il y a {index + 1}j</span>
          <div className="w-0 h-0 border-l-[8px] border-l-[var(--accent-light)] border-r-[8px] border-r-transparent border-t-[8px] border-t-transparent" />
        </div>
        <div className="bg-[var(--accent-light)] text-[var(--accent-light-text)] rounded-2xl rounded-br-md px-4 py-2.5 max-w-[80%]">
          <p className="text-sm leading-relaxed">{pair.question}</p>
        </div>
      </div>

      {/* Answer bubble (left) */}
      <div className="flex flex-col items-start gap-1">
        <div className="flex items-center gap-2">
          <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-[var(--border)] border-t-[8px] border-t-transparent" />
          <span className="text-[10px] text-[var(--accent)] font-medium">Emind</span>
        </div>
        <div className="bg-white border border-[var(--border)] rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[85%] shadow-sm">
          <p className="text-sm text-[var(--text)] leading-relaxed">
            {pair.answer}
          </p>
        </div>
      </div>
    </div>
  )
}

export function QuestionExamples() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          el.querySelectorAll('.reveal-child').forEach((child, i) => {
            setTimeout(() => {
              ;(child as HTMLElement).style.opacity = '1'
              ;(child as HTMLElement).style.transform = 'none'
            }, i * 100)
          })
          observer.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="examples"
      className="py-24 px-6"
      style={{ background: 'var(--surface)' }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--accent)]/20 bg-white mb-5">
            <MessageCircle size={12} className="text-[var(--accent)]" strokeWidth={1.5} />
            <span className="text-xs font-medium text-[var(--accent)] uppercase tracking-widest">
              Exemples
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-semibold text-[var(--text)] tracking-tight mb-3">
            Des questions que tu te poses déjà.
          </h2>
          <p className="text-base text-[var(--text-2)] max-w-md mx-auto leading-relaxed">
            Emind comprend le contexte de chacun de tes fils de discussion.
          </p>
        </div>

        {/* Chat bubbles */}
        <div className="flex flex-col gap-6">
          {questionPairs.map((pair: QuestionPair, i: number) => (
            <div
              key={i}
              className="reveal-child"
              style={{
                opacity: 0,
                transform: 'translateY(20px)',
                transition: 'opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)',
              }}
            >
              <QuestionBubble pair={pair} index={i} />
            </div>
          ))}
        </div>

        {/* Bottom CTA hint */}
        <div className="mt-10 text-center">
          <p className="text-sm text-[var(--text-2)]">
            Essaie toi-même — connexion en 30 secondes.
          </p>
        </div>
      </div>
    </section>
  )
}
