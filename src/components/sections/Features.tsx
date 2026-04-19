'use client'

import { motion } from 'framer-motion'
import { Brain, History, Users } from 'lucide-react'

const FEATURES = [
  {
    icon: Brain,
    iconBg: '#c24b46',
    iconColor: '#ffffff',
    title: 'Analyse contextuelle',
    description:
      'Notre IA comprend le sens de vos échanges pour vous proposer des réponses pertinentes et adaptées à chaque situation.',
  },
  {
    icon: History,
    iconBg: '#e8b056',
    iconColor: '#2d3235',
    title: 'Historique complet',
    description:
      "Recherchez dans tous vos messages passés en un instant. Plus jamais d'information perdue dans les profondeurs de votre boîte mail.",
  },
  {
    icon: Users,
    iconBg: '#1d8f6d',
    iconColor: '#ffffff',
    title: 'Collaboration fluide',
    description:
      'Partagez des threads, assignez des tâches et suivez les conversations de votre équipe sans perdre le fil.',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
}

export function Features() {
  return (
    <section className="w-full py-24 px-6" style={{ backgroundColor: '#efeadd' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h3
            className="text-4xl font-semibold tracking-tight mb-4"
            style={{
              fontFamily: 'var(--font-sans)',
              color: '#2d3235',
            }}
          >
            Pourquoi utiliser Emind ?
          </h3>
          <p
            className="text-xl max-w-2xl"
            style={{
              fontFamily: 'var(--font-mono)',
              color: '#5a5f63',
            }}
          >
            L&apos;IA au service de vos conversations email. Plus de temps perdu
            à chercher, plus de messages oubliés.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              className="bg-white border-2 p-8 flex flex-col items-start gap-4 feature-card-lift"
              style={{
                borderColor: '#2d3235',
                boxShadow: '6px 6px 0px 0px rgba(45,50,53,0.2)',
              }}
            >
              {/* Icon */}
              <div
                className="p-3 border-2 flex items-center justify-center"
                style={{
                  backgroundColor: feature.iconBg,
                  color: feature.iconColor,
                  borderColor: '#2d3235',
                  boxShadow: '4px 4px 0px 0px #2d3235',
                }}
              >
                <feature.icon size={32} strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h4
                className="text-2xl font-semibold mt-4"
                style={{
                  fontFamily: 'var(--font-sans)',
                  color: '#2d3235',
                }}
              >
                {feature.title}
              </h4>

              {/* Description */}
              <p
                className="text-lg leading-relaxed"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: '#5a5f63',
                }}
              >
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
