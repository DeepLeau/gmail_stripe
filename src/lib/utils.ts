import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combine clsx class names with Tailwind CSS merge logic.
 * Enables conditional Tailwind class application without conflicts.
 *
 * @example cn('text-lg font-medium', isActive && 'text-blue-600')
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
