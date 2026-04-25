'use client';

import { useState } from 'react';
import { ArrowUpCircle, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UpgradePromptProps {
  currentPlan: string;
  usagePercentage: number;
  onUpgrade: () => void;
  suggestedPlan?: string;
}

const PLAN_DISPLAY_NAMES: Record<string, string> = {
  free: 'Start',
  start: 'Scale',
  scale: 'Team',
};

export function UpgradePrompt({
  currentPlan,
  usagePercentage,
  onUpgrade,
  suggestedPlan,
}: UpgradePromptProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const nextPlan = suggestedPlan || PLAN_DISPLAY_NAMES[currentPlan] || 'a higher plan';
  const upgradeMessage = usagePercentage >= 90
    ? `You&apos;ve almost reached your limit. Upgrade now to continue uninterrupted access.`
    : `You&apos;re at ${Math.round(usagePercentage)}% of your monthly usage. Upgrade to unlock more messages.`;

  const handleUpgradeClick = () => {
    setIsLoading(true);
    onUpgrade();
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-105 z-50 flex items-center justify-center"
        aria-label="Upgrade your plan"
      >
        <ArrowUpCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-white" />
          <span className="text-sm font-semibold text-white">Upgrade Recommended</span>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-white/70 hover:text-white text-xs"
        >
          Dismiss
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
            usagePercentage >= 90 ? 'bg-red-100' : 'bg-amber-100'
          )}>
            <ArrowUpCircle className={cn(
              'w-5 h-5',
              usagePercentage >= 90 ? 'text-red-600' : 'text-amber-600'
            )} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              Upgrade to {nextPlan}
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              {upgradeMessage}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-500">Current usage</span>
            <span className={cn(
              'font-medium',
              usagePercentage >= 90 ? 'text-red-600' : 'text-amber-600'
            )}>
              {Math.round(usagePercentage)}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300',
                usagePercentage >= 90 ? 'bg-red-500' : 'bg-amber-500'
              )}
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        </div>

        <button
          onClick={handleUpgradeClick}
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ArrowUpCircle className="w-4 h-4" />
              Upgrade Now
            </>
          )}
        </button>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">What you&apos;ll get:</p>
          <ul className="space-y-1">
            {currentPlan === 'free' || currentPlan === 'start' ? (
              <>
                <li className="text-xs text-gray-600 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-green-500 rounded-full" />
                  Priority support
                </li>
                <li className="text-xs text-gray-600 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-green-500 rounded-full" />
                  Advanced analytics
                </li>
                <li className="text-xs text-gray-600 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-green-500 rounded-full" />
                  API access
                </li>
              </>
            ) : (
              <>
                <li className="text-xs text-gray-600 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-green-500 rounded-full" />
                  Team collaboration features
                </li>
                <li className="text-xs text-gray-600 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-green-500 rounded-full" />
                  Dedicated support
                </li>
                <li className="text-xs text-gray-600 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-green-500 rounded-full" />
                  Custom integrations
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default UpgradePrompt;
