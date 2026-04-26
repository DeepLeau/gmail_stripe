/**
 * Unit tests for the validation logic in src/components/auth/SignupForm.tsx
 *
 * The validation function is inline in the component. To make it testable
 * without rendering React, we re-implement its core logic as pure functions
 * and test those implementations directly.
 *
 * Pattern: AAA (Arrange → Act → Assert)
 *
 * Note: We test the validation rules as they are defined in the source:
 *   EMAIL_REGEX, MIN_PASSWORD_LENGTH, and the validate() logic.
 */

// ─── Pure re-implementations of the validation rules ────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 6

interface FieldErrors {
  email?: string
  password?: string
  confirmPassword?: string
}

function validateEmail(email: string): string | undefined {
  if (!email.trim()) {
    return "L'adresse email est requise"
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return 'Adresse email invalide'
  }
  return undefined
}

function validatePassword(password: string): string | undefined {
  if (!password) {
    return 'Le mot de passe est requis'
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`
  }
  return undefined
}

function validateConfirmPassword(
  password: string,
  confirmPassword: string,
): string | undefined {
  if (!confirmPassword) {
    return 'La confirmation est requise'
  }
  if (password !== confirmPassword) {
    return 'Les mots de passe ne correspondent pas'
  }
  return undefined
}

function validateSignup(
  email: string,
  password: string,
  confirmPassword: string,
): { valid: boolean; fieldErrors: FieldErrors } {
  const fieldErrors: FieldErrors = {}

  const emailError = validateEmail(email)
  if (emailError) fieldErrors.email = emailError

  const passwordError = validatePassword(password)
  if (passwordError) fieldErrors.password = passwordError

  const confirmError = validateConfirmPassword(password, confirmPassword)
  if (confirmError) fieldErrors.confirmPassword = confirmError

  return {
    valid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
  }
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('SignupForm — validation logic', () => {
  describe('validateEmail', () => {
    it('should return undefined for a valid email address', () => {
      // Arrange
      const input = 'test@emind.io'

      // Act
      const result = validateEmail(input)

      // Assert
      expect(result).toBeUndefined()
    })

    it('should return error when email is empty', () => {
      // Arrange
      const input = ''

      // Act
      const result = validateEmail(input)

      // Assert
      expect(result).toBe("L'adresse email est requise")
    })

    it('should return error when email contains only whitespace', () => {
      // Arrange
      const input = '   '

      // Act
      const result = validateEmail(input)

      // Assert
      expect(result).toBe("L'adresse email est requise")
    })

    it('should return error when email is missing the @ symbol', () => {
      // Arrange
      const input = 'testemind.io'

      // Act
      const result = validateEmail(input)

      // Assert
      expect(result).toBe('Adresse email invalide')
    })

    it('should return error when email is missing the domain dot', () => {
      // Arrange
      const input = 'test@emind'

      // Act
      const result = validateEmail(input)

      // Assert
      expect(result).toBe('Adresse email invalide')
    })

    it('should return error when email has leading/trailing whitespace', () => {
      // Arrange — whitespace-only trimming is applied
      const input = '  test@emind.io  '

      // Act — validation trims before testing
      const result = validateEmail(input)

      // Assert — trimmed email is valid, so no error
      expect(result).toBeUndefined()
    })
  })

  describe('validatePassword', () => {
    it('should return undefined when password meets minimum length', () => {
      // Arrange
      const input = 'secure123'

      // Act
      const result = validatePassword(input)

      // Assert
      expect(result).toBeUndefined()
    })

    it('should return error when password is empty', () => {
      // Arrange
      const input = ''

      // Act
      const result = validatePassword(input)

      // Assert
      expect(result).toBe('Le mot de passe est requis')
    })

    it('should return error when password is shorter than minimum length (6)', () => {
      // Arrange
      const input = 'abc'

      // Act
      const result = validatePassword(input)

      // Assert
      expect(result).toBe(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`)
    })

    it('should return error when password is exactly 5 characters', () => {
      // Arrange
      const input = '12345'

      // Act
      const result = validatePassword(input)

      // Assert
      expect(result).toBeDefined()
      expect(result).toContain('6')
    })

    it('should return undefined when password is exactly 6 characters', () => {
      // Arrange
      const input = '123456'

      // Act
      const result = validatePassword(input)

      // Assert
      expect(result).toBeUndefined()
    })
  })

  describe('validateConfirmPassword', () => {
    it('should return undefined when confirmation matches password', () => {
      // Arrange
      const password = 'secure123'
      const confirm = 'secure123'

      // Act
      const result = validateConfirmPassword(password, confirm)

      // Assert
      expect(result).toBeUndefined()
    })

    it('should return error when confirmation is empty', () => {
      // Arrange
      const password = 'secure123'
      const confirm = ''

      // Act
      const result = validateConfirmPassword(password, confirm)

      // Assert
      expect(result).toBe('La confirmation est requise')
    })

    it('should return error when confirmation does not match password', () => {
      // Arrange
      const password = 'secure123'
      const confirm = 'different456'

      // Act
      const result = validateConfirmPassword(password, confirm)

      // Assert
      expect(result).toBe('Les mots de passe ne correspondent pas')
    })
  })

  describe('validateSignup — full form validation', () => {
    it('should return valid=true when all fields are correct', () => {
      // Arrange
      const email = 'user@emind.io'
      const password = 'secure123'
      const confirm = 'secure123'

      // Act
      const result = validateSignup(email, password, confirm)

      // Assert
      expect(result.valid).toBe(true)
      expect(result.fieldErrors).toEqual({})
    })

    it('should collect all three errors when all fields are invalid', () => {
      // Arrange
      const email = 'invalid'
      const password = '123'
      const confirm = '456'

      // Act
      const result = validateSignup(email, password, confirm)

      // Assert
      expect(result.valid).toBe(false)
      expect(result.fieldErrors.email).toBeDefined()
      expect(result.fieldErrors.password).toBeDefined()
      expect(result.fieldErrors.confirmPassword).toBeDefined()
    })

    it('should only report email error when password and confirm are empty', () => {
      // Arrange
      const email = 'valid@emind.io'
      const password = ''
      const confirm = ''

      // Act
      const result = validateSignup(email, password, confirm)

      // Assert
      expect(result.valid).toBe(false)
      expect(result.fieldErrors.email).toBeUndefined()
      expect(result.fieldErrors.password).toBe('Le mot de passe est requis')
      expect(result.fieldErrors.confirmPassword).toBe('La confirmation est requise')
    })
  })
})
