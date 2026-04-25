'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface UsageMeterProps {
  used: number;
  limit: number;
  label?: string;
  showDetailedStats?: boolean;
  compact?: boolean;
}

export function UsageMeter({
  used,
  limit,
  label = 'Usage',
  showDetailedStats = true,
  compact = false,
}: UsageMeterProps) {
  const [animatedUsed, setAnimatedUsed] = useState(0);
  const percentage = Math.min((used / limit) * 100, 100);
  const remaining = Math.max(limit - used, 0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedUsed(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const getStatusColor = () => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-indigo-500';
  };

  const getStatusTextColor = () => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getStatusLabel = () => {
    if (percentage >= 90) return 'Critical';
    if (percentage >= 70) return 'Warning';
    return 'Normal';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              'absolute left-0 top-0 h-full rounded-full transition-all duration-500 ease-out',
              getStatusColor()
            )}
            style={{ width: `${animatedUsed}%` }}
          />
        </div>
        <span className={cn('text-xs font-medium', getStatusTextColor())}>
          {used}/{limit}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            <span className={cn('font-semibold', getStatusTextColor())}>{used}</span>
            <span className="mx-1">/</span>
            <span className="font-medium">{limit}</span>
          </span>
          {percentage >= 70 && (
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                percentage >= 90
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              )}
            >
              {getStatusLabel()}
            </span>
          )}
        </div>
      </div>

      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'absolute left-0 top-0 h-full rounded-full transition-all duration-500 ease-out',
            getStatusColor()
          )}
          style={{ width: `${animatedUsed}%` }}
        />
      </div>

      {showDetailedStats && (
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>
              <span className="font-medium text-gray-700">{percentage.toFixed(0)}%</span> used
            </span>
            <span>
              <span className="font-medium text-gray-700">{remaining}</span> remaining
            </span>
          </div>
        </div>
      )}

      {percentage >= 80 && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800">
            <span className="font-medium">Tip:</span> You&apos;re approaching your limit.
            Consider upgrading to avoid service interruption.
          </p>
        </div>
      )}
    </div>
  );
}

export default UsageMeter;
