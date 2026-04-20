import { computeQuotaLevel, type QuotaLevel } from '@/lib/chat/quota'

describe('computeQuotaLevel', () => {
  // Branch: remainingPercent <= 0 → 'exceeded'
  it('should return "exceeded" when remainingPercent is 0', () => {
    // Arrange
    const remainingPercent = 0
    // Act
    const result = computeQuotaLevel(remainingPercent)
    // Assert
    expect(result).toBe('exceeded')
  })

  it('should return "exceeded" when remainingPercent is negative', () => {
    // Arrange
    const remainingPercent = -5
    // Act
    const result = computeQuotaLevel(remainingPercent)
    // Assert
    expect(result).toBe('exceeded')
  })

  // Branch: remainingPercent < 25 → 'critical'
  it('should return "critical" when remainingPercent is between 0 and 25 (exclusive)', () => {
    // Arrange
    const remainingPercent = 10
    // Act
    const result = computeQuotaLevel(remainingPercent)
    // Assert
    expect(result).toBe('critical')
  })

  it('should return "critical" when remainingPercent is just below 25', () => {
    // Arrange
    const remainingPercent = 24.99
    // Act
    const result = computeQuotaLevel(remainingPercent)
    // Assert
    expect(result).toBe('critical')
  })

  // Branch: remainingPercent <= 50 → 'warning' (and 25 is not < 25, so 25 → warning)
  it('should return "warning" when remainingPercent is exactly 25', () => {
    // Arrange
    const remainingPercent = 25
    // Act
    const result = computeQuotaLevel(remainingPercent)
    // Assert
    expect(result).toBe('warning')
  })

  it('should return "warning" when remainingPercent is between 25 and 50', () => {
    // Arrange
    const remainingPercent = 40
    // Act
    const result = computeQuotaLevel(remainingPercent)
    // Assert
    expect(result).toBe('warning')
  })

  // Branch: remainingPercent > 50 → 'idle'
  it('should return "idle" when remainingPercent is just above 50', () => {
    // Arrange
    const remainingPercent = 50.01
    // Act
    const result = computeQuotaLevel(remainingPercent)
    // Assert
    expect(result).toBe('idle')
  })

  it('should return "idle" when remainingPercent is 100 (full quota)', () => {
    // Arrange
    const remainingPercent = 100
    // Act
    const result = computeQuotaLevel(remainingPercent)
    // Assert
    expect(result).toBe('idle')
  })
})
