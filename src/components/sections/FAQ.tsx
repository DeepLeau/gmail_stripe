'use client'

import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface FAQItem {
  question: string
  answer: string
}

const faqItems: FAQItem[] = [
  {
    question: 'Comment fonctionne le système de messages ?',
    answer:
      "Chaque plan dispose d'un quota mensuel de messages. Chaque question que vous posez à Emind consomme un message. Le compteur se réinitialise automatiquement chaque mois à la date de votre renouvellement.",
  },
  {
    question: "Que se passe-t-il quand j'atteins ma limite ?",
    answer:
      "Quand votre quota est épuisé, vous recevez un message vous invitant à changer de plan. Vous pouvez à tout moment passer à un plan supérieur pour retrouver l'accès instantané. Votre historique reste consultable même après dépassement.",
  },
  {
    question: 'Puis-je changer de plan à tout moment ?',
    answer:
      "Oui. Vous pouvez upgrader ou downgrader votre plan à tout moment depuis votre tableau de bord. Les changements prennent effet immédiatement et la facturation est ajustée au prorata.",
  },
  {
    question: 'Mes données email sont-elles sécurisées ?',
    answer:
      "Absolument. Emind applique un chiffrement de bout en bout, ne stocke aucun email en clair, et respecte pleinement le RGPD. Vos messages sont traités de manière transient et vos données restent vôtres.",
  },
  {
    question: "Comment fonctionne l'essai gratuit ?",
    answer:
      "Vous commencez automatiquement avec le plan Start (10 messages/mois) sans engagement. Lorsque vous souhaitez envoyer plus de messages, vous pouvez passer à Scale ou Team en un clic depuis votre tableau de bord.",
  },
  {
    question: 'Emind peut-il répondre à mes clients à ma place ?',
    answer:
      "Emind rédige des propositions de réponse que vous validez avant envoi. Nous ne prenons jamais de décision à votre place : l'IA augmente votre productivité, mais le contrôle reste entre vos mains à chaque étape.",
  },
]

function FAQAccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div
      className="bg-white cursor-pointer"
      style={{
        border: '2px solid #2d3235',
        boxShadow: '4px 4px 0px 0px #2d3235',
      }}
      onClick={onToggle}
    >
      <button
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
        aria-expanded={isOpen}
      >
        <span
          className="text-base font-semibold flex-1"
          style={{
            color: '#2d3235',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {item.question}
        </span>
        <ChevronDown
          size={18}
          strokeWidth={2}
          className={cn(
            'flex-shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
          style={{ color: '#c24b46' }}
        />
      </button>

      <div
        className={cn(
          'accordion-content',
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        )}
        style={{ maxHeight: isOpen ? '500px' : '0px' }}
      >
        <div
          className="px-6 pb-6 text-sm leading-relaxed"
          style={{ color: '#5a5f63' }}
        >
          {item.answer}
        </div>
      </div>
    </div>
  )
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="w-full py-24" style={{ backgroundColor: '#efeadd' }}>
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div
            className="inline-block border-2 px-3 py-1 text-sm font-semibold uppercase tracking-wide mb-4"
            style={{
              backgroundColor: '#e8b056',
              color: '#2d3235',
              borderColor: '#2d3235',
            }}
          >
            FAQ
          </div>
          <h2
            className="text-4xl font-semibold tracking-tight mb-4"
            style={{
              color: '#2d3235',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Questions fréquentes
          </h2>
          <p className="text-lg" style={{ color: '#5a5f63' }}>
            Tout ce que vous devez savoir sur Emind et son fonctionnement.
          </p>
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col gap-3"
        >
          {faqItems.map((item, i) => (
            <FAQAccordionItem
              key={i}
              item={item}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
