'use client';

import { cn } from '@/lib/utils';

export interface PlanBadgeProps {
  planId: string;
  className?: string;
}

const PLAN_CONFIG = {
  free: {
    label: 'Free',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-300',
  },
  start: {
    label: 'Start',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300',
  },
  scale: {
    label: 'Scale',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-300',
  },
  team: {
    label: 'Team',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-300',
  },
} as const;

export function PlanBadge({ planId, className }: PlanBadgeProps) {
  const config = PLAN_CONFIG[planId as keyof typeof PLAN_CONFIG] || PLAN_CONFIG.free;

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border',
        config.bgColor,
        config.textColor,
        config.borderColor,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export default PlanBadge;
