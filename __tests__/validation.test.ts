import {
  validateEmail,
  validatePassword,
  validateSignupPayload,
  EMAIL_REGEX,
  MIN_PASSWORD_LENGTH,
} from '@/lib/auth/validation'

describe('validateEmail', () => {
  it('should return null when email is valid', () => {
    // Arrange
    const email = 'test@example.com'
    // Act
    const result = validateEmail(email)
    // Assert
    expect(result).toBeNull()
  })

  it('should return error when email is empty', () => {
    // Arrange
    const email = ''
    // Act
    const result = validateEmail(email)
    // Assert
    expect(result).toBe("L'adresse email est requise")
  })

  it('should return error when email is whitespace only', () => {
    // Arrange
    const email = '   '
    // Act
    const result = validateEmail(email)
    // Assert
    expect(result).toBe("L'adresse email est requise")
  })

  it('should return error when email has no @', () => {
    // Arrange
    const email = 'testexample.com'
    // Act
    const result = validateEmail(email)
    // Assert
    expect(result).toBe('Adresse email invalide')
  })

  it('should return error when email has no domain', () => {
    // Arrange
    const email = 'test@'
    // Act
    const result = validateEmail(email)
    // Assert
    expect(result).toBe('Adresse email invalide')
  })

  it('should return error when email has no TLD', () => {
    // Arrange
    const email = 'test@example'
    // Act
    const result = validateEmail(email)
    // Assert
    expect(result).toBe('Adresse email invalide')
  })

  it('should return error when email has spaces around it (trim)', () => {
    // Arrange
    const email = '  test@example.com  '
    // Act
    const result = validateEmail(email)
    // Assert — trimmed value is valid
    expect(result).toBeNull()
  })
})

describe('validatePassword', () => {
  it('should return null when password meets minimum length', () => {
    // Arrange
    const password = 'password123'
    // Act
    const result = validatePassword(password)
    // Assert
    expect(result).toBeNull()
  })

  it('should return null when password is exactly 6 characters', () => {
    // Arrange
    const password = '123456'
    // Act
    const result = validatePassword(password)
    // Assert
    expect(result).toBeNull()
  })

  it('should return error when password is empty', () => {
    // Arrange
    const password = ''
    // Act
    const result = validatePassword(password)
    // Assert
    expect(result).toBe('Le mot de passe est requis')
  })

  it('should return error when password is too short', () => {
    // Arrange
    const password = '12345'
    // Act
    const result = validatePassword(password)
    // Assert
    expect(result).toBe(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`)
  })

  it('should return error when password is 1 character', () => {
    // Arrange
    const password = 'a'
    // Act
    const result = validatePassword(password)
    // Assert
    expect(result).toBe(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`)
  })
})

describe('validateSignupPayload — full form validation', () => {
  it('should return valid:true when all fields are correct', () => {
    // Arrange
    const email = 'user@domain.com'
    const password = 'secret123'
    const confirmPassword = 'secret123'
    // Act
    const result = validateSignupPayload(email, password, confirmPassword)
    // Assert
    expect(result.valid).toBe(true)
    expect(result.fieldErrors).toEqual({})
  })

  it('should return fieldErrors for all three fields when all are empty', () => {
    // Arrange
    const email = ''
    const password = ''
    const confirmPassword = ''
    // Act
    const result = validateSignupPayload(email, password, confirmPassword)
    // Assert
    expect(result.valid).toBe(false)
    expect(result.fieldErrors.email).toBe("L'adresse email est requise")
    expect(result.fieldErrors.password).toBe('Le mot de passe est requis')
    expect(result.fieldErrors.confirmPassword).toBe('La confirmation est requise')
  })

  it('should return error on email when email is invalid', () => {
    // Arrange
    const email = 'not-an-email'
    const password = 'password123'
    const confirmPassword = 'password123'
    // Act
    const result = validateSignupPayload(email, password, confirmPassword)
    // Assert
    expect(result.valid).toBe(false)
    expect(result.fieldErrors.email).toBe('Adresse email invalide')
    expect(result.fieldErrors.password).toBeUndefined()
  })

  it('should return error on confirmPassword when passwords do not match', () => {
    // Arrange
    const email = 'user@domain.com'
    const password = 'password123'
    const confirmPassword = 'different456'
    // Act
    const result = validateSignupPayload(email, password, confirmPassword)
    // Assert
    expect(result.valid).toBe(false)
    expect(result.fieldErrors.confirmPassword).toBe(
      'Les mots de passe ne correspondent pas'
    )
  })

  it('should return error on password when password is too short', () => {
    // Arrange
    const email = 'user@domain.com'
    const password = '12345'
    const confirmPassword = '12345'
    // Act
    const result = validateSignupPayload(email, password, confirmPassword)
    // Assert
    expect(result.valid).toBe(false)
    expect(result.fieldErrors.password).toBe(
      `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`
    )
  })
})
