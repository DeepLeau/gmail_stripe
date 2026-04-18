'use client'

import { motion, type Variants } from 'framer-motion'
import { Shield, Lock, Server, type LucideIcon } from 'lucide-react'

const trustItems = [
  {
    title: "Chiffrement AES-256",
    description: "de bout en bout",
    icon: "Shield",
    detail: "Toutes tes données sont chiffrées en transit et au repos.",
  },
  {
    title: "Zéro revente",
    description: "de données tierces",
    icon: "Lock",
    detail: "Tes emails ne sont jamais revendus, partagés ou utilisés à des fins marketing.",
  },
  {
    title: "Accès révocable",
    description: "à tout moment",
    icon: "Server",
    detail: "Tu peux révoquer l'accès à ta boîte mail en 1 clic, à tout moment.",
  },
]

const ICON_MAP: Record<string, LucideIcon> = {
  Shield,
  Lock,
  Server,
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

export function TrustSecurity() {
  return (
    <section className="py-24 px-6" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-4xl mx-auto">
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
              Sécurité
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
            Tes données restent les tiennes.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="text-base max-w-lg mx-auto"
            style={{ color: 'var(--text-2)', lineHeight: 1.65 }}
          >
            Emind est conçu autour de la confiance. Aucune compromission,
            aucune ambiguïté — juste un assistant qui travaille pour toi.
          </motion.p>
        </div>

        {/* Trust items grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {trustItems.map((item, i) => {
            const Icon = ICON_MAP[item.icon]
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                className="metric rounded-xl p-8 text-center flex flex-col items-center gap-4 cursor-default"
                style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
              >
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: 'var(--accent-light)',
                    border: '1px solid rgba(59, 130, 246, 0.15)',
                  }}
                >
                  {Icon && (
                    <Icon
                      className="w-7 h-7"
                      strokeWidth={1.5}
                      color="var(--accent)"
                    />
                  )}
                </div>

                {/* Title */}
                <div>
                  <p
                    className="text-xl font-semibold tracking-tight mb-1"
                    style={{ color: 'var(--text)', letterSpacing: '-0.015em' }}
                  >
                    {item.title}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: 'var(--text-2)' }}
                  >
                    {item.description}
                  </p>
                </div>

                {/* Detail */}
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-3)', lineHeight: 1.6 }}
                >
                  {item.detail}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
