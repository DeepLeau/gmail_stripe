export const dynamic = 'force-dynamic'

import { CheckoutButton } from '@/components/checkout-button'
import { Check } from 'lucide-react'

const PLANS = [
  {
    id: 'start',
    display: 'Start',
    limit: 10,
    price: 9,
    description: 'Parfait pour découvrir',
    features: [
      '10 messages par mois',
      'Accès à toutes les fonctionnalités',
      'Support par email',
    ],
    popular: false,
  },
  {
    id: 'scale',
    display: 'Scale',
    limit: 50,
    price: 29,
    description: 'Pour les professionnels',
    features: [
      '50 messages par mois',
      'Accès prioritaire',
      'Support prioritaire',
      'Statistiques détaillées',
    ],
    popular: true,
  },
  {
    id: 'team',
    display: 'Team',
    limit: 100,
    price: 79,
    description: 'Pour les équipes',
    features: [
      '100 messages par mois',
      'Accès prioritaire',
      'Support dédié',
      'Statistiques avancées',
      'Multi-utilisateurs',
    ],
    popular: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-[var(--text)] mb-4">
            Choisissez votre plan
          </h1>
          <p className="text-lg text-[var(--text-2)] max-w-2xl mx-auto">
            Des forfaits adaptés à vos besoins. Commencez gratuitement et évoluez selon vos exigences.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`
                relative flex flex-col rounded-2xl p-6
                bg-[var(--bg-elevated)] border
                ${
                  plan.popular
                    ? 'border-[var(--accent)] shadow-lg shadow-[var(--accent)]/10'
                    : 'border-[var(--border-md)]'
                }
              `}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--accent)] text-white">
                    Le plus populaire
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-[var(--text)] mb-1">
                  {plan.display}
                </h2>
                <p className="text-sm text-[var(--text-3)]">
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[var(--text)]">
                    {plan.price}€
                  </span>
                  <span className="text-[var(--text-3)]">/mois</span>
                </div>
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-[var(--text-2)]"
                  >
                    <Check
                      size={16}
                      className="shrink-0 mt-0.5 text-[var(--accent)]"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Checkout Button */}
              <CheckoutButton
                planId={plan.id}
                planDisplay={plan.display}
                messagesLimit={plan.limit}
              />
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-[var(--text-3)] mt-12">
          Tous les forfaits incluent un essai gratuit. Aucune carte bancaire requise pour commencer.
        </p>
      </div>
    </div>
  )
}
