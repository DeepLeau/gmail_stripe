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

export type PlanFeatureItem = {
  text: string
  included: boolean
}

export type Plan = {
  name: string
  price: string
  description: string
  features: PlanFeatureItem[]
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
      "Nous proposons deux plans : un plan gratuit limité à 100 questions/mois et 1 boîte mail, et un plan Pro illimité avec plusieurs boîtes mail et une priorité de traitement. Aucune surprise — les prix sont transparents dès la page d'accueil.",
  },
  {
    question: "Mes données email sont-elles en sécurité ?",
    answer:
      "Absolument. Emind applique un chiffrement de bout en bout, ne stocke aucun email en clair, et respecte pleinement le RGPD. Vous pouvez supprimer vos données à tout moment depuis votre tableau de bord.",
  },
  {
    question: "Puis-je connecter plusieurs boîtes email ?",
    answer:
      "Le plan gratuit autorise 1 boîte mail. Le plan Pro permet de connecter autant de boîtes que vous le souhaitez — idéal pour les petites équipes qui gèrent plusieurs adresses professionnel@ et contact@.",
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
    name: "Free",
    price: "0",
    description: "Pour découvrir Emind et automiser vos réponses email.",
    features: [
      { text: "100 questions/mois", included: true },
      { text: "1 boîte email connectée", included: true },
      { text: "Réponses en 10 secondes", included: true },
      { text: "Support par email", included: true },
      { text: "Multi-comptes", included: false },
      { text: "Priorité de traitement", included: false },
    ],
    cta: "Commencer gratuitement",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "29",
    description: "Pour les professionals qui gèrent plusieurs boîtes email.",
    features: [
      { text: "Questions illimitées", included: true },
      { text: "Boîtes email illimitées", included: true },
      { text: "Priorité de traitement", included: true },
      { text: "Réponses en 3 secondes", included: true },
      { text: "Support prioritaire", included: true },
      { text: "Multi-comptes", included: false },
    ],
    cta: "Passer Pro",
    highlighted: true,
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
