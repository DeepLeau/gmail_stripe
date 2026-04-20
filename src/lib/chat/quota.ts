/**
 * Pure business logic for quota banner level computation.
 * Extracted from QuotaBanner.tsx for unit testability.
 */

export type QuotaLevel = 'idle' | 'warning' | 'critical' | 'exceeded'

/**
 * Computes the quota banner level based on remaining percent.
 *
 * Rules (copied verbatim from QuotaBanner.tsx):
 *   remainingPercent <= 0  → 'exceeded'
 *   remainingPercent < 25  → 'critical'
 *   remainingPercent <= 50 → 'warning'
 *   otherwise             → 'idle'
 */
export function computeQuotaLevel(remainingPercent: number): QuotaLevel {
  if (remainingPercent <= 0) {
    return 'exceeded'
  }
  if (remainingPercent < 25) {
    return 'critical'
  }
  if (remainingPercent <= 50) {
    return 'warning'
  }
  return 'idle'
}
