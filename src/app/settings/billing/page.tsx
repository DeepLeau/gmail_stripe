'use client';

import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, AlertCircle, Loader2, TrendingUp, Zap, Users, Shield } from 'lucide-react';
import PlanBadge from '@/components/billing/PlanBadge';
import UsageMeter from '@/components/billing/UsageMeter';
import UpgradePrompt from '@/components/billing/UpgradePrompt';

interface Plan {
  id: string;
  display: string;
  messagesLimit: number;
  price: number;
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: 'free',
    display: 'Free',
    messagesLimit: 10,
    price: 0,
    features: ['10 messages/month', 'Basic support', 'Standard analytics'],
  },
  {
    id: 'start',
    display: 'Start',
    messagesLimit: 10,
    price: 9,
    features: ['10 messages/month', 'Priority support', 'Advanced analytics', 'API access'],
  },
  {
    id: 'scale',
    display: 'Scale',
    messagesLimit: 50,
    price: 29,
    features: ['50 messages/month', 'Priority support', 'Advanced analytics', 'API access', 'Custom integrations'],
  },
  {
    id: 'team',
    display: 'Team',
    messagesLimit: 100,
    price: 99,
    features: ['100 messages/month', 'Dedicated support', 'Advanced analytics', 'API access', 'Custom integrations', 'Team features'],
  },
];

interface UserSubscription {
  planId: string;
  usedMessages: number;
  maxMessages: number;
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPortal, setShowPortal] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/stripe/subscription');
        if (response.ok) {
          const data = await response.json();
          setSubscription(data);
        } else {
          // Demo fallback
          setSubscription({
            planId: 'free',
            usedMessages: 3,
            maxMessages: 10,
          });
        }
      } catch (err) {
        setError('Failed to load subscription details');
      } finally {
        setIsLoadingSubscription(false);
      }
    };

    fetchSubscription();
  }, []);

  const handleUpgrade = async (planId: string) => {
    setIsUpgrading(planId);
    setError(null);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      setError('Failed to initiate checkout. Please try again.');
      setIsUpgrading(null);
    }
  };

  const handleManageSubscription = async () => {
    setShowPortal(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL received');
      }
    } catch (err) {
      setError('Failed to open billing portal. Please try again.');
      setShowPortal(false);
    }
  };

  const currentPlan = subscription?.planId || 'free';
  const currentPlanIndex = PLANS.findIndex(p => p.id === currentPlan);
  const usagePercentage = subscription ? (subscription.usedMessages / subscription.maxMessages) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your subscription, view usage, and upgrade your plan.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Current Plan Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
              <p className="text-sm text-gray-500 mt-1">Your active subscription details</p>
            </div>
            <PlanBadge planId={currentPlan} />
          </div>

          {isLoadingSubscription ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : subscription ? (
            <div className="space-y-6">
              <UsageMeter
                used={subscription.usedMessages}
                limit={subscription.maxMessages}
                label="Messages used this month"
              />

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {currentPlan === 'free' ? 'No payment method' : 'Next billing date: Jan 15, 2025'}
                  </span>
                </div>
                {currentPlan !== 'free' && (
                  <button
                    onClick={handleManageSubscription}
                    disabled={showPortal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {showPortal ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Opening...
                      </span>
                    ) : (
                      'Manage Subscription'
                    )}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Unable to load subscription data.</p>
          )}
        </div>

        {/* Available Plans Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Available Plans</h2>
              <p className="text-sm text-gray-500 mt-1">Choose the plan that best fits your needs</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANS.map((plan, index) => {
              const isCurrentPlan = plan.id === currentPlan;
              const isRecommended = plan.id === 'scale';
              const showUpgrade = index > currentPlanIndex;

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-xl border-2 p-6 transition-all ${
                    isCurrentPlan
                      ? 'border-indigo-500 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {isRecommended && !isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-indigo-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Recommended
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">{plan.display}</h3>
                    <div className="mt-2 flex items-baseline justify-center">
                      <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-sm text-gray-500 ml-1">/month</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isCurrentPlan || isUpgrading === plan.id || !showUpgrade}
                    className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                      isCurrentPlan
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : showUpgrade
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {isUpgrading === plan.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </span>
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : showUpgrade ? (
                      `Upgrade to ${plan.display}`
                    ) : (
                      'Select Plan'
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upgrade Prompt for users approaching limit */}
        {subscription && usagePercentage >= 70 && currentPlan !== 'team' && (
          <UpgradePrompt
            currentPlan={currentPlan}
            usagePercentage={usagePercentage}
            onUpgrade={() => {
              const nextPlan = PLANS[currentPlanIndex + 1];
              if (nextPlan) handleUpgrade(nextPlan.id);
            }}
          />
        )}

        {/* Feature Comparison */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Comparison</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Messages</p>
              <p className="text-xs text-gray-500 mt-1">Varies by plan</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Shield className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Support</p>
              <p className="text-xs text-gray-500 mt-1">Priority on paid plans</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Analytics</p>
              <p className="text-xs text-gray-500 mt-1">Advanced on scale+</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Users className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Team</p>
              <p className="text-xs text-gray-500 mt-1">Only on Team plan</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
