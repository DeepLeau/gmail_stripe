import { notFound } from 'next/navigation'
import { AuthCard } from '@/components/auth/AuthCard'
import { StripeSignupForm } from './StripeSignupForm'

type StripePlanName = 'start' | 'scale' | 'team'

const VALID_PLANS: StripePlanName[] = ['start', 'scale', 'team']

const PLAN_DESCRIPTIONS: Record<StripePlanName, { title: string; subtitle: string }> = {
  start: {
    title: 'Commencer avec Start',
    subtitle: '10 messages / mois',
  },
  scale: {
    title: 'Passer à Scale',
    subtitle: '50 messages / mois',
  },
  team: {
    title: 'Rejoindre Team',
    subtitle: '100 messages / mois',
  },
}

interface SignupPlanPageProps {
  params: Promise<{
    plan: string
  }>
}

export default async function SignupPlanPage({ params }: SignupPlanPageProps) {
  const { plan } = await params

  if (!VALID_PLANS.includes(plan as StripePlanName)) {
    notFound()
  }

  const planName = plan as StripePlanName
  const { title, subtitle } = PLAN_DESCRIPTIONS[planName]

  return (
    <AuthCard
      title={title}
      altLinkLabel="Choisir un autre plan"
      altLinkHref="/#pricing"
    >
      <div className="mb-4 text-center">
        <p className="text-xs" style={{ color: 'var(--text-3)' }}>
          {subtitle}
        </p>
      </div>
      <StripeSignupForm plan={planName} />
    </AuthCard>
  )
}
