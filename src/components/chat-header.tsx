'use client'

import { useState, useEffect } from 'react'
import { Crown, Zap, Users, User, Menu, X, LogOut } from 'lucide-react'
import Link from 'next/link'

interface SubscriptionInfo {
  plan: 'start' | 'scale' | 'team' | null
  messagesUsed: number
  messagesLimit: number
}

interface ChatHeaderProps {
  userEmail?: string
}

const planConfig = {
  start: {
    name: 'Start',
    limit: 10,
    badgeColor: 'bg-zinc-100 text-zinc-700',
    icon: User,
  },
  scale: {
    name: 'Scale',
    limit: 50,
    badgeColor: 'bg-amber-100 text-amber-700',
    icon: Zap,
  },
  team: {
    name: 'Team',
    limit: 100,
    badgeColor: 'bg-purple-100 text-purple-700',
    icon: Crown,
  },
}

export default function ChatHeader({ userEmail }: ChatHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [subscription, setSubscription] = useState<SubscriptionInfo>({
    plan: null,
    messagesUsed: 0,
    messagesLimit: 0,
  })

  useEffect(() => {
    // Fetch subscription info from API
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/subscription/status')
        if (response.ok) {
          const data = await response.json()
          setSubscription({
            plan: data.plan,
            messagesUsed: data.messagesUsed,
            messagesLimit: data.messagesLimit,
          })
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error)
      }
    }

    fetchSubscription()
  }, [])

  const currentPlan = subscription.plan ? planConfig[subscription.plan] : null
  const remainingMessages = subscription.messagesLimit - subscription.messagesUsed
  const usagePercentage = subscription.messagesLimit > 0
    ? (subscription.messagesUsed / subscription.messagesLimit) * 100
    : 0

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-semibold text-zinc-900">Emind</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Subscription Badge */}
            {currentPlan ? (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${currentPlan.badgeColor}`}>
                <currentPlan.icon className="w-4 h-4" />
                {currentPlan.name}
              </div>
            ) : (
              <Link
                href="/pricing"
                className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                Choisir un plan
              </Link>
            )}

            {/* Messages Usage */}
            {subscription.messagesLimit > 0 && (
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      usagePercentage > 80 ? 'bg-red-500' : usagePercentage > 50 ? 'bg-amber-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
                <span className="text-sm text-zinc-600">
                  {remainingMessages} restants
                </span>
              </div>
            )}

            {/* User Menu */}
            {userEmail ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-zinc-600">{userEmail}</span>
                <button className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Se connecter
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-zinc-600"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-zinc-200">
            <div className="flex flex-col gap-4">
              {/* Mobile Subscription Badge */}
              {currentPlan ? (
                <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium w-fit ${currentPlan.badgeColor}`}>
                  <currentPlan.icon className="w-4 h-4" />
                  {currentPlan.name}
                </div>
              ) : (
                <Link
                  href="/pricing"
                  className="text-sm text-zinc-600 hover:text-zinc-900"
                >
                  Choisir un plan
                </Link>
              )}

              {/* Mobile Messages Usage */}
              {subscription.messagesLimit > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        usagePercentage > 80 ? 'bg-red-500' : usagePercentage > 50 ? 'bg-amber-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm text-zinc-600 whitespace-nowrap">
                    {remainingMessages} restants
                  </span>
                </div>
              )}

              {/* Mobile User */}
              {userEmail && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600">{userEmail}</span>
                  <button className="p-2 text-zinc-400 hover:text-zinc-600">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
