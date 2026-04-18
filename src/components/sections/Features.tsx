'use client'

import { motion, type Variants } from 'framer-motion'
import {
  Search,
  FileText,
  Users,
  History,
  Check,
  type LucideIcon,
} from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  Search,
  FileText,
  Users,
  History,
}

const features = [
  {
    title: "Recherche comme dans une vraie conversation",
    description:
      "Plus besoin de mots-clés. Tape ta question comme tu la formulerais à un collègue. Emind comprend.",
    icon: "Search",
    badge: "Indexé",
    terminals: [
      "$ Qui peut m'aider sur le contrat Dupont ?",
      "→ Marc Dubois (3 emails), Sophie Martin (1 email)…",
    ],
  },
  {
    title: "Des fils de 50 emails réduits à 3 lignes",
    description:
      "Emind synthétise chaque conversation pour que tu saches instantly de quoi il retourne.",
    icon: "FileText",
    badge: "Auto",
    bullets: [
      "Contrat signé le 12 janvier",
      "Clause de pénalités négociée à 2%",
      "Prochaine échéance : 15 mars",
    ],
  },
  {
    title: "Qui travaille sur quoi, sans chercher",
    description:
      "Pour chaque sujet, Emind identifie les personnes clés et leur niveau d'implication.",
    icon: "Users",
    badge: "Mis à jour",
    contacts: [
      { name: "Marc Dubois", role: "3 fils actifs", tag: "Contrat Dupont" },
      { name: "Sophie Martin", role: "1 fil actif", tag: "Lancement" },
      { name: "Julie Morel", role: "5 fils actifs", tag: "Budget Q2" },
    ],
  },
  {
    title: "Tu ne poses jamais la même question deux fois",
    description:
      "Toutes tes questions et leurs réponses sont sauvegardées. Revisite-les à tout moment.",
    icon: "History",
    badge: "Persistant",
    history: [
      { q: "Qui gère le budget Q2 ?", time: "Il y a 2j" },
      { q: "Résumé fil Marc — contrat Dupont", time: "Il y a 5j" },
      { q: "Contacts relance sans réponse", time: "Il y a 1 sem" },
    ],
  },
]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

export function Features() {
  return (
    <section
      className="py-24 px-6"
      style={{ backgroundColor: 'var(--surface)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest"
              style={{
                backgroundColor: 'var(--accent-light)',
                color: 'var(--accent)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: 'var(--accent)' }}
              />
              Fonctionnalités
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4"
            style={{ color: 'var(--text)', letterSpacing: '-0.025em' }}
          >
            Tout ce dont tu as besoin pour maîtriser tes emails
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="text-base max-w-lg mx-auto"
            style={{ color: 'var(--text-2)', lineHeight: 1.65 }}
          >
            Emind ne se contente pas de chercher. Il comprend le contexte,
            synthétise l'essentiel et te fait gagner un temps précieux.
          </motion.p>
        </div>

        {/* Grid 2x2 */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {features.map((feature, i) => {
            const Icon = ICON_MAP[feature.icon]
            return (
              <motion.div
                key={i}
                variants={cardVariants}
                whileHover={{ y: -4, transition: { duration: 0.15 } }}
                className="feature-card rounded-xl p-7 flex flex-col gap-5 cursor-default"
                style={{
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.03)',
                }}
              >
                {/* Top row: badge + icon */}
                <div className="flex items-center justify-between">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
                    style={{
                      backgroundColor: 'var(--accent-light)',
                      color: 'var(--accent)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: 'var(--accent)' }}
                    />
                    {feature.badge}
                  </span>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: 'var(--accent-light)',
                      border: '1px solid rgba(59, 130, 246, 0.15)',
                    }}
                  >
                    {Icon && (
                      <Icon
                        className="w-5 h-5"
                        strokeWidth={1.5}
                        color="var(--accent)"
                      />
                    )}
                  </div>
                </div>

                {/* Title + description */}
                <div>
                  <h3
                    className="text-lg font-semibold tracking-tight mb-2"
                    style={{ color: 'var(--text)', letterSpacing: '-0.015em' }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--text-2)', lineHeight: 1.65 }}
                  >
                    {feature.description}
                  </p>
                </div>

                {/* Feature-specific visual content */}
                <div className="mt-auto">
                  {feature.terminals && (
                    <div className="terminal">
                      <div className="terminal__bar">
                        <div className="terminal__dot terminal__dot--red" />
                        <div className="terminal__dot terminal__dot--yellow" />
                        <div className="terminal__dot terminal__dot--green" />
                      </div>
                      {feature.terminals.map((line, j) => (
                        <div
                          key={j}
                          className="terminal__line"
                          style={{
                            animationDelay: `${0.4 + j * 0.4}s`,
                            color: j === 0 ? 'var(--text)' : 'var(--text-2)',
                            fontFamily: 'var(--font-space-mono), Space Mono, monospace',
                            fontSize: '12px',
                          }}
                        >
                          {line.startsWith('$') ? (
                            <>
                              <span
                                className="terminal__prompt"
                                style={{ color: 'var(--accent)' }}
                              >
                                $
                              </span>{' '}
                              <span>{line.slice(2)}</span>
                            </>
                          ) : (
                            <span className="terminal__out">{line}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {feature.bullets && (
                    <div
                      className="rounded-lg p-4 space-y-2"
                      style={{
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {feature.bullets.map((bullet, j) => (
                        <div
                          key={j}
                          className="flex items-start gap-2.5 text-sm"
                          style={{ color: 'var(--text-2)' }}
                        >
                          <Check
                            size={14}
                            className="mt-0.5 flex-shrink-0"
                            strokeWidth={2}
                            color="var(--accent)"
                          />
                          {bullet}
                        </div>
                      ))}
                    </div>
                  )}

                  {feature.contacts && (
                    <div className="space-y-2">
                      {feature.contacts.map((contact, j) => (
                        <div
                          key={j}
                          className="flex items-center justify-between p-3 rounded-lg"
                          style={{
                            backgroundColor: 'var(--surface)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                              style={{
                                backgroundColor: 'var(--accent-light)',
                                color: 'var(--accent)',
                              }}
                            >
                              {contact.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </div>
                            <div>
                              <p
                                className="text-sm font-medium"
                                style={{ color: 'var(--text)' }}
                              >
                                {contact.name}
                              </p>
                              <p
                                className="text-xs"
                                style={{ color: 'var(--text-3)' }}
                              >
                                {contact.role}
                              </p>
                            </div>
                          </div>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: 'var(--accent-light)',
                              color: 'var(--accent)',
                            }}
                          >
                            {contact.tag}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {feature.history && (
                    <div className="space-y-1.5">
                      {feature.history.map((item, j) => (
                        <div
                          key={j}
                          className="flex items-center justify-between p-3 rounded-lg"
                          style={{
                            backgroundColor: 'var(--surface)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <History
                              size={14}
                              strokeWidth={1.5}
                              color="var(--text-3)"
                            />
                            <span
                              className="text-sm"
                              style={{ color: 'var(--text-2)' }}
                            >
                              {item.q}
                            </span>
                          </div>
                          <span
                            className="text-xs"
                            style={{ color: 'var(--text-3)' }}
                          >
                            {item.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
