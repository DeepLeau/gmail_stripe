/**
 * src/lib/stripe/plans.ts
 *
 * Re-export du config pour la compatibilité avec les imports existants.
 * Les composants doivent migrer progressivement vers @/lib/stripe/config.
 */
export { STRIPE_PLANS, type PlanConfig, type StripePlanName } from './config'
