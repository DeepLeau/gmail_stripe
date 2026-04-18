'use client'

import { useEffect, useRef } from 'react'
import { Plug, Scan, MessageCircle, Check } from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import { steps } from '@/lib/data'

// Map icon string names to Lucide components
function getIcon(name: string, props?: LucideProps) {
  switch (name) {
    case 'Plug':
      return <Plug {...props} />
    case 'Scan':
      return <Scan {...props} />
    case 'MessageCircle':
      return <MessageCircle {...props} />
    default:
      return <Check {...props} />
  }
}

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          el.querySelectorAll('[data-reveal]').forEach((child, i) => {
            setTimeout(() => {
              ;(child as HTMLElement).style.opacity = '1'
              ;(child as HTMLElement).style.transform = 'none'
            }, i * 150)
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
      className="py-24 px-6 bg-white relative overflow-hidden"
    >
      {/* Decorative dot grid */}
      <div
        className="deco-grid deco-grid--dots"
        style={{
          width: 200,
          height: 200,
          top: 40,
          right: 40,
          borderRadius: 16,
        }}
      />

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Steps */}
          <div>
            {/* Header */}
            <div
              data-reveal
              style={{
                opacity: 0,
                transform: 'translateY(20px)',
                transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
              }}
            >
              {/* Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--accent)]/20 bg-[var(--accent-light)] mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                <span className="text-xs font-medium text-[var(--accent)] uppercase tracking-widest">
                  Comment ça marche
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-semibold text-[var(--text)] tracking-tight mb-3 leading-tight">
                En 3 étapes, pose une question
                <br />
                <span className="text-gradient-h">à tous tes emails.</span>
              </h2>
              <p className="text-base text-[var(--text-2)] leading-relaxed mb-10 max-w-md">
                Connecte ta boîte en 1 clic, Emind indexe tout, puis pose ta
                question en langage naturel.
              </p>
            </div>

            {/* Steps */}
            <div className="platform__steps flex flex-col gap-0">
              {steps.map((step, i) => (
                <div
                  key={step.label}
                  className="platform__step flex gap-5 py-5 border-b border-[var(--border)] last:border-b-0"
                  data-reveal
                  style={{
                    opacity: 0,
                    transform: 'translateY(16px)',
                    transition: `all 0.6s cubic-bezier(0.16,1,0.3,1) ${0.1 + i * 0.15}s`,
                  }}
                >
                  {/* Number */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center">
                    <span className="text-xs font-mono font-bold text-[var(--accent)]">
                      {i + 1}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[var(--accent-light)] border border-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
                        {getIcon(step.icon, {
                          size: 15,
                          strokeWidth: 1.5,
                          className: 'text-[var(--accent)]',
                        })}
                      </div>
                      <h3 className="text-base font-semibold text-[var(--text)] tracking-tight">
                        {step.label}
                      </h3>
                      {i === 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent)] border border-[var(--accent)]/10 font-medium">
                          1 clic
                        </span>
                      )}
                      {i === 1 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent)] border border-[var(--accent)]/10 font-medium">
                          IA
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--text-2)] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Dashboard mockup */}
          <div
            className="reveal-right"
            data-reveal
            style={{
              opacity: 0,
              transform: 'translateX(32px)',
              transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s',
            }}
          >
            <div className="dashboard spin-border p-0 overflow-hidden">
              {/* Top bar */}
              <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center gap-3 bg-[var(--surface)]">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <span className="text-xs text-[var(--text-2)] font-mono">
                  Emind — boîte de réception
                </span>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-[10px] text-[var(--accent)] font-mono">
                    LIVE
                  </span>
                </div>
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-3 gap-px bg-[var(--border)]">
                {[
                  { val: '12,847', label: 'Emails' },
                  { val: '234', label: 'Threads' },
                  { val: '89', label: 'Contacts' },
                ].map((m) => (
                  <div key={m.label} className="bg-white px-4 py-3.5 text-center">
                    <div className="text-base font-bold text-[var(--text)] tracking-tight text-gradient-h">
                      {m.val}
                    </div>
                    <div className="text-[10px] text-[var(--text-3)] uppercase tracking-widest font-mono mt-0.5">
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat area */}
              <div className="px-5 py-4">
                {/* Question input */}
                <div className="bg-[var(--accent-light)] border border-[var(--accent)]/10 rounded-xl px-4 py-3 mb-3">
                  <div className="flex items-center gap-2">
                    <MessageCircle
                      size={13}
                      className="text-[var(--accent)]"
                      strokeWidth={1.5}
                    />
                    <span className="text-xs text-[var(--accent-light-text)] font-medium">
                      Qui m'a relancé sans répondre ?
                    </span>
                  </div>
                </div>

                {/* Answer */}
                <div className="bg-white border border-[var(--border)] rounded-xl px-4 py-3 shadow-sm">
                  <p className="text-xs text-[var(--text-2)] mb-2">
                    Réponse d'Emind :
                  </p>
                  <div className="space-y-1.5">
                    {[
                      { name: 'Marc Dubois', detail: '2 relances cette semaine' },
                      { name: 'Sophie Martin', detail: '1 relance il y a 3j' },
                      {
                        name: 'Freelance onboarding',
                        detail: 'En attente de validation',
                      },
                    ].map((item, i) => (
                      <div
                        key={item.name}
                        className="flex items-center gap-2 text-xs"
                        style={{ animationDelay: `${i * 200}ms` }}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] flex-shrink-0"
                          style={{
                            animation: `pulse-dot 2s ease-in-out infinite ${i * 0.4}s`,
                          }}
                        />
                        <span className="font-medium text-[var(--text)]">
                          {item.name}
                        </span>
                        <span className="text-[var(--text-3)]">
                          — {item.detail}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Alerts */}
              <div className="px-5 pb-5 flex flex-col gap-2">
                <div className="text-[10px] text-[var(--text-3)] uppercase tracking-widest font-mono mb-1">
                  Activité récente
                </div>
                {[
                  {
                    color: 'bg-green-500',
                    text: 'Contrat Dupont — signature prévue mars',
                    time: '2h',
                  },
                  {
                    color: 'bg-yellow-400',
                    text: 'Projet X — 3 emails en attente depuis 5j',
                    time: '1j',
                  },
                ].map((alert) => (
                  <div
                    key={alert.text}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${alert.color} flex-shrink-0`} />
                    <span className="text-[var(--text-2)] flex-1">
                      {alert.text}
                    </span>
                    <span className="text-[var(--text-3)] font-mono text-[10px]">
                      {alert.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
