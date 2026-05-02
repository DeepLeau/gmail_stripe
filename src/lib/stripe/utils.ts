/**
 * src/lib/stripe/utils.ts
 *
 * Utilities Stripe — formatage du nombre de messages pour l'UI.
 */
export interface FormatOptions {
  singular: string
  plural: string
}

/**
 * Returns a human-readable message count string.
 * Replaces {count} in the template with the number.
 *
 * @param count - Number of messages
 * @param options - Templates for singular and plural
 * @example
 * formatMessageCount(1, { singular: '{count} message', plural: '{count} messages' })
 * // => "1 message"
 * formatMessageCount(42, { singular: '{count} message', plural: '{count} messages' })
 * // => "42 messages"
 */
export function formatMessageCount(count: number, options: FormatOptions): string {
  const template = count === 1 ? options.singular : options.plural
  return template.replace('{count}', String(count))
}
