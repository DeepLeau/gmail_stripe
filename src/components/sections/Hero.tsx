'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Mail, Search, MessageCircle, Zap, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

// Chat mock data for the hero
const chatMessages = [
  {
    id: 1,
    type: 'question' as const,
    text: "Qui m'a relancé cette semaine ?",
    time: 'il y a 2 min',
  },
  {
    id: 2,
    type: 'answer' as const,
    text: 'Marc Dubois — 2 relances, Sophie Martin — 1 relance.',
    time: '',
  },
  {
    id: 3,
    type: 'question' as const,
    text: 'Résume mes échanges avec Marc sur le projet X.',
    time: 'maintenant',
  },
  {
    id: 4,
    type: 'answer' as const,
    text: 'Fil de 12 emails. En cours depuis 2 semaines. Prochaine étape : validation du budget.',
    time: '',
  },
]

// Animated counter
function AnimatedCounter({
  target,
  suffix = '',
}: {
  target: number
  suffix?: string
}) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true
          const duration = 1800
          const startTime = performance.now()

          const step = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1)
            const ease = 1 - Math.pow(1 - progress, 3)
            setValue(Math.floor(target * ease))
            if (progress < 1) requestAnimationFrame(step)
            else setValue(target)
          }
          requestAnimationFrame(step)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  return (
    <span ref={ref}>
      {value.toLocaleString()}
      {suffix}
    </span>
  )
}

// Chat bubble component
function ChatBubble({
  message,
  visible,
  index,
}: {
  message: (typeof chatMessages)[0]
  visible: boolean
  index: number
}) {
  const isQuestion = message.type === 'question'

  return (
    <div
      className={cn(
        'flex flex-col gap-1 transition-all duration-500',
        isQuestion ? 'items-end' : 'items-start',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      )}
      style={{ transitionDelay: `${index * 400}ms` }}
    >
      {/* Tail */}
      {isQuestion ? (
        <div className="w-0 h-0 border-l-[8px] border-l-[var(--accent-light)] border-r-[8px] border-r-transparent border-t-[8px] border-t-transparent self-end mr-3" />
      ) : (
        <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-[var(--border)] border-t-[8px] border-t-transparent self-start ml-3" />
      )}

      <div
        className={cn(
          'rounded-2xl px-4 py-2.5 max-w-[85%]',
          isQuestion
            ? 'bg-[var(--accent-light)] text-[var(--accent-light-text)] rounded-br-md'
            : 'bg-white border border-[var(--border)] text-[var(--text)] rounded-bl-md'
        )}
      >
        <p className="text-sm leading-relaxed">{message.text}</p>
      </div>

      {isQuestion && message.time && (
        <span className="text-[10px] text-[var(--text-3)] px-1 self-end mr-1">
          {message.time}
        </span>
      )}
    </div>
  )
}

export function Hero() {
  const [chatVisible, setChatVisible] = useState(false)
  const [statsVisible, setStatsVisible] = useState(false)
  const [contentVisible, setContentVisible] = useState(false)

  const heroRef = useRef<HTMLElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Animate content first
    const t1 = setTimeout(() => setContentVisible(true), 200)
    // Then chat
    const t2 = setTimeout(() => setChatVisible(true), 800)
    // Then stats
    const t3 = setTimeout(() => setStatsVisible(true), 1200)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-14"
      style={{ background: 'var(--bg)' }}
    >
      {/* Background orbs */}
      <div className="orb orb--1" />
      <div className="orb orb--2" />

      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 30% 40%, rgba(59,130,246,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 70% 60%, rgba(139,92,246,0.05) 0%, transparent 50%), radial-gradient(ellipse 50% 35% at 50% 30%, rgba(59,130,246,0.04) 0%, transparent 55%)',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left: Content */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Badge */}
            <div
              className={cn(
                'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--accent)]/20 bg-[var(--accent-light)] mb-6 transition-all duration-700',
                contentVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4'
              )}
              style={{ animation: contentVisible ? 'badge-glow 3s ease-in-out infinite' : undefined }}
            >
              <div className="glow-dot" />
              <span className="text-xs font-medium text-[var(--accent)]">
                Nouveau — connecté à Gmail & Outlook
              </span>
            </div>

            {/* Title */}
            <h1
              className={cn(
                'text-4xl sm:text-5xl lg:text-6xl font-light tracking-[-0.03em] leading-[1.06] mb-6 w-full transition-all duration-700',
                contentVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-6'
              )}
            >
              <span className="block text-[var(--text)]">
                Toutes les réponses
              </span>
              <span className="block text-[var(--accent)] mt-1">
                sont dans ta boîte mail.
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className={cn(
                'text-base sm:text-lg text-[var(--text-2)] leading-relaxed mb-8 max-w-lg transition-all duration-700 delay-100',
                contentVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-6'
              )}
            >
              Emind connecte tes emails à une IA. Pose une question en
              langage naturel, obtiens une réponse précise avec les sources.
            </p>

            {/* CTAs */}
            <div
              className={cn(
                'flex flex-col sm:flex-row gap-3 w-full sm:w-auto mb-10 transition-all duration-700 delay-200',
                contentVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-6'
              )}
            >
              <a
                href="#"
                className="btn-hero-primary"
              >
                Connecter ma boîte mail
                <ArrowRight size={16} strokeWidth={1.5} />
              </a>
              <a
                href="#examples"
                className="btn-hero-ghost"
              >
                Voir une démo
                <ArrowRight size={16} strokeWidth={1.5} />
              </a>
            </div>

            {/* Stats strip */}
            <div
              ref={statsRef}
              className={cn(
                'flex flex-wrap gap-px rounded-2xl overflow-hidden border border-[var(--border)] transition-all duration-700 delay-300',
                statsVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4'
              )}
            >
              {[
                { value: '50k+', label: 'Emails indexés' },
                { value: '<2s', label: 'Temps de réponse' },
                { value: '100%', label: 'Chiffré de bout en bout' },
                { value: '12k+', label: 'Utilisateurs actifs' },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="flex-1 min-w-[120px] px-4 py-3 bg-[var(--surface)] flex flex-col items-center sm:items-start gap-0.5"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <div className="text-base sm:text-lg font-bold text-[var(--text)] tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-[10px] text-[var(--text-3)] uppercase tracking-widest font-mono">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Chat mockup */}
          <div
            ref={chatRef}
            className={cn(
              'w-full max-w-md flex-shrink-0 transition-all duration-700 delay-200',
              chatVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            {/* Chat window */}
            <div className="rounded-2xl border border-[var(--border)] bg-white shadow-[0_8px_40px_rgba(0,0,0,0.08),0_0_1px_rgba(0,0,0,0.04)] overflow-hidden">
              {/* Top bar */}
              <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2 bg-[var(--surface)]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex items-center gap-1.5 ml-2">
                  <Mail size={12} className="text-[var(--accent)]" strokeWidth={1.5} />
                  <span className="text-xs text-[var(--text-2)] font-mono">
                    Emind — conversation
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-green-500"
                    style={{ animation: 'pulse-dot 2s ease-in-out infinite' }}
                  />
                  <span className="text-[10px] text-[var(--accent)] font-mono">
                    EN LIGNE
                  </span>
                </div>
              </div>

              {/* Chat messages */}
              <div className="p-5 flex flex-col gap-4 min-h-[340px] max-h-[400px] overflow-y-auto">
                {chatMessages.map((msg, i) => (
                  <ChatBubble
                    key={msg.id}
                    message={msg}
                    visible={chatVisible}
                    index={i}
                  />
                ))}
              </div>

              {/* Input bar */}
              <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--surface)] flex items-center gap-2">
                <div className="w-full bg-white border border-[var(--border)] rounded-lg px-3 py-2 flex items-center gap-2">
                  <Search size={13} className="text-[var(--text-3)] flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-xs text-[var(--text-3)]">
                    Pose ta question à Emind...
                  </span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
                  <Zap size={14} className="text-white" strokeWidth={2} />
                </div>
              </div>
            </div>

            {/* Floating mini metrics */}
            <div className="mt-4 flex gap-3">
              {[
                { icon: Mail, label: 'Gmail & Outlook' },
                { icon: Shield, label: 'OAuth sécurisé' },
                { icon: MessageCircle, label: 'Réponses sourcées' },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border)] bg-white text-[10px] text-[var(--text-2)]"
                >
                  <Icon size={11} strokeWidth={1.5} className="text-[var(--accent)]" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, var(--bg) 0%, transparent 100%)',
        }}
      />
    </section>
  )
}
