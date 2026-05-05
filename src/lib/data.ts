// ============================================================
// Types — shared across all landing page components
// ============================================================

export type QuestionPair = {
  question: string
  answer: string
}

export type Step = {
  label: string
  description: string
  icon: string
}

export type Feature = {
  title: string
  description: string
  icon: string
}

export type TrustItem = {
  title: string
  description: string
  icon: string
}

export type Plan = {
  name: string
  price: string
  description: string
  features: string[]
  cta: string
  highlighted: boolean
}

export type FooterLink = {
  label: string
  href: string
}

// ============================================================
// Question pairs — section "Exemples de questions"
// ============================================================

export const questionPairs: QuestionPair[] = [
  {
    question: "Qui puis-je contacter pour un problème légal ?",
    answer:
      "Pour toute question relative aux mentions légales, au RGPD ou à un contrat, vous pouvez écrire à notre équipe juridique à l'adresse legal@emind.io. Nous répondons sous 48h ouvrées.",
  },
  {
    question: "Comment fonctionne la tarification ?",
    answer:
      "Nous proposons trois plans : Start (10€/mois, 10 messages), Scale (39€/mois, 50 messages) et Team (79€/mois, 100 messages). Aucun engagement — les prix sont transparents dès la page d'accueil.",
  },
  {
    question: "Mes données email sont-elles en sécurité ?",
    answer:
      "Absolument. Emind applique un chiffrement de bout en bout, ne stocke aucun email en clair, et respecte pleinement le RGPD. Vous pouvez supprimer vos données à tout moment depuis votre tableau de bord.",
  },
  {
    question: "Puis-je connecter plusieurs boîtes email ?",
    answer:
      "Tous les plans supportent plusieurs boîtes mail. Le nombre dépend de votre plan : Start permet 1 boîte, Scale et Team offrent une gestion multi-comptes idéale pour les petites équipes.",
  },
  {
    question: "L'IA peut-elle répondre à mes clients à ma place ?",
    answer:
      "Emind rédige des propositions de réponse que vous validez avant envoi. Nous ne prenons jamais de décision à votre place : l'IA augmente votre productivité, mais le contrôle reste entre vos mains à chaque étape.",
  },
]

// ============================================================
// Steps — section "Comment ça marche"
// ============================================================

export const steps: Step[] = [
  {
    label: "Étape 1",
    description:
      "Connectez votre boîte email en quelques clics. Emind se synchronise avec vos messages existants sans rien modifier.",
    icon: "Mail",
  },
  {
    label: "Étape 2",
    description:
      "Posez une question ou décrivez votre besoin. L'IA analyse votre boîte et vous propose une réponse adaptée en quelques secondes.",
    icon: "MessageSquare",
  },
  {
    label: "Étape 3",
    description:
      "Validez la réponse proposée et envoyez-la. Vous gardez le contrôle à chaque étape — Emind accélère sans imposer.",
    icon: "Send",
  },
]

// ============================================================
// Features — section "Fonctionnalités"
// ============================================================

export const features: Feature[] = [
  {
    title: "Réponses générées en temps réel",
    description:
      "L'IA analyse le contexte de chaque conversation et rédige une proposition de réponse en moins de 3 secondes. Plus besoin de chercher les bonnes formules.",
    icon: "Zap",
  },
  {
    title: "Analyse intelligente de votre boîte",
    description:
      "Emind comprend le ton de vos échanges, identifie les conversations en attente et vous suggère les actions prioritaires pour ne rien oublier.",
    icon: "Brain",
  },
  {
    title: "Multi-comptes email",
    description:
      "Gérez plusieurs boîtes mail depuis une seule interface. Idéal pour les freelancers et les petites équipes qui jonglent entre différentes adresses.",
    icon: "Inbox",
  },
  {
    title: "Confidentialité garantie",
    description:
      "Vos emails ne sont jamais stockés de façon permanente. Le traitement est transient, chiffré, et respectueux du RGPD. Vos données restent vôtres.",
    icon: "ShieldCheck",
  },
]

// ============================================================
// Trust items — section "Confiance & Sécurité"
// ============================================================

export const trustItems: TrustItem[] = [
  {
    title: "Chiffrement de bout en bout",
    description:
      "Toutes vos communications sont chiffrées. Aucun tiers non autorisé ne peut accéder au contenu de vos emails.",
    icon: "Lock",
  },
  {
    title: "Conforme RGPD",
    description:
      "Emind est conçu pour respecter la réglementation européenne. Vous pouvez exporter ou supprimer l'ensemble de vos données à tout moment.",
    icon: "Shield",
  },
  {
    title: "Aucun email stocké en clair",
    description:
      "Nous ne conservons pas vos messages. Le traitement est transient — l'IA analyse sans mémoriser.",
    icon: "EyeOff",
  },
]

// ============================================================
// Plans — section "Tarification"
// ============================================================

export const plans: Plan[] = [
  {
    name: "Start",
    price: "10",
    description: "Pour démarrer avec Emind et découvrir les réponses intelligentes.",
    features: [
      "10 messages/mois",
      "1 boîte email connectée",
      "Réponses en 10 secondes",
      "Support par email",
    ],
    cta: "Commencer avec Start",
    highlighted: false,
  },
  {
    name: "Scale",
    price: "39",
    description: "Pour les professionnels qui gèrent plus de volumes et plusieurs boîtes email.",
    features: [
      "50 messages/mois",
      "Boîtes email multiples",
      "Réponses en 5 secondes",
      "Support prioritaire",
    ],
    cta: "Passer à Scale",
    highlighted: true,
  },
  {
    name: "Team",
    price: "79",
    description: "Pour les équipes qui ont besoin de plus et veulent travailler en collaboration.",
    features: [
      "100 messages/mois",
      "Boîtes email illimitées",
      "Réponses en 3 secondes",
      "Support dédié",
    ],
    cta: "Passer à Team",
    highlighted: false,
  },
]

// ============================================================
// Footer links — section "Pied de page"
// ============================================================

export const footerLinks: FooterLink[] = [
  {
    label: "Confidentialité",
    href: "#",
  },
  {
    label: "CGU",
    href: "#",
  },
  {
    label: "Contact",
    href: "#",
  },
]

// ============================================================
// Plan data helpers — delegate to canonical src/lib/plans.ts
// ============================================================

import { getAllPlans, getPlanDisplayName } from '@/lib/plans'

export type PlanSlug = 'start' | 'scale' | 'team'

export interface PlanData {
  slug: PlanSlug
  name: string
  price: number
  priceDisplay: string
  unitLabel: string
  unitLabelPlural: string
  description: string
}

/**
 * Returns the full plan data for a given slug.
 * Delegates to src/lib/plans.ts which is the source of truth.
 */
export function getPlanBySlug(slug: string): PlanData | undefined {
  const lower = slug.toLowerCase()
  const allPlans = getAllPlans()
  const matched = allPlans.find((p: ReturnType<typeof getAllPlans>[number]) => p.id === lower)
  if (!matched) return undefined

  const unitLabel = 'message'
  const unitLabelPlural = 'messages'

  return {
    slug: lower as PlanSlug,
    name: getPlanDisplayName(lower as PlanSlug),
    price: matched.monthly_price_cents / 100,
    priceDisplay: `${matched.monthly_price_cents / 100} €`,
    unitLabel,
    unitLabelPlural,
    description: matched.description ?? '',
  }
}
