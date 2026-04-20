/**
 * Pure validation logic for the signup form.
 * Extracted from SignupForm.tsx for unit testability.
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const MIN_PASSWORD_LENGTH = 6

export type FieldErrors = {
  email?: string
  password?: string
  confirmPassword?: string
}

export type ValidationResult =
  | { valid: true; fieldErrors: {} }
  | { valid: false; fieldErrors: FieldErrors }

/**
 * Validates a single email value.
 * @returns error message string, or null if valid
 */
export function validateEmail(email: string): string | null {
  if (!email.trim()) {
    return "L'adresse email est requise"
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return 'Adresse email invalide'
  }
  return null
}

/**
 * Validates a single password value.
 * @returns error message string, or null if valid
 */
export function validatePassword(password: string): string | null {
  if (!password) {
    return 'Le mot de passe est requis'
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`
  }
  return null
}

/**
 * Validates the full signup payload.
 * Implements the exact same logic as SignupForm.validate().
 */
export function validateSignupPayload(
  email: string,
  password: string,
  confirmPassword: string
): ValidationResult {
  const fieldErrors: FieldErrors = {}

  const emailError = validateEmail(email)
  if (emailError) fieldErrors.email = emailError

  const passwordError = validatePassword(password)
  if (passwordError) fieldErrors.password = passwordError

  if (!confirmPassword) {
    fieldErrors.confirmPassword = 'La confirmation est requise'
  } else if (password !== confirmPassword) {
    fieldErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { valid: false, fieldErrors }
  }

  return { valid: true, fieldErrors: {} }
}
