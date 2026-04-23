import CheckoutButton from '@/components/checkout-button'
import { Check } from 'lucide-react'

const plans = [
  {
    id: 'start',
    name: 'Start',
    description: 'Pour découvrir Emind',
    price: '9',
    messagesLimit: 10,
    features: [
      '10 messages par mois',
      'Accès à tous les connecteurs email',
      'Réponses en français',
      'Support par email',
    ],
    popular: false,
  },
  {
    id: 'scale',
    name: 'Scale',
    description: 'Pour les professionnels',
    price: '29',
    messagesLimit: 50,
    features: [
      '50 messages par mois',
      'Accès à tous les connecteurs email',
      'Réponses en français',
      'Historique des conversations',
      'Support prioritaire',
    ],
    popular: true,
  },
  {
    id: 'team',
    name: 'Team',
    description: 'Pour les équipes',
    price: '99',
    messagesLimit: 100,
    features: [
      '100 messages par mois',
      'Accès à tous les connecteurs email',
      'Réponses en français',
      'Historique illimité',
      'Support dédié',
      'Multi-comptes',
    ],
    popular: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-6xl mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-4">
            Choisissez votre plan
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Accédez à la puissance d&apos;Emind pour organiser et interroger vos emails
            en langage naturel.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`
                relative rounded-2xl p-8 
                ${plan.popular
                  ? 'bg-zinc-900 text-white shadow-2xl scale-105'
                  : 'bg-white shadow-lg border border-zinc-200'
                }
              `}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-amber-400 text-zinc-900 text-sm font-semibold px-4 py-1 rounded-full">
                    Populaire
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h2 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-zinc-900'}`}>
                  {plan.name}
                </h2>
                <p className={`text-sm ${plan.popular ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-zinc-900'}`}>
                  {plan.price}€
                </span>
                <span className={`text-sm ${plan.popular ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  /mois
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className={`flex items-center gap-3 text-sm ${
                      plan.popular ? 'text-zinc-300' : 'text-zinc-700'
                    }`}
                  >
                    <Check
                      className={`w-4 h-4 flex-shrink-0 ${
                        plan.popular ? 'text-amber-400' : 'text-zinc-900'
                      }`}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Checkout Button */}
              <CheckoutButton
                planId={plan.id}
                planName={plan.name}
                className={`
                  ${plan.popular
                    ? 'bg-white text-zinc-900 hover:bg-zinc-100'
                    : 'bg-zinc-900 text-white hover:bg-zinc-800'
                  }
                `}
              />
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <p className="text-center text-zinc-500 text-sm mt-12">
          Tous les plans incluent un essai gratuit de 7 jours. Annulez à tout moment.
        </p>
      </div>
    </div>
  )
}
