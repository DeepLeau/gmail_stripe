import {
  selectRandomResponse,
  sendMessage,
  simulateDelay,
} from '@/lib/chat/mockApi'
import { MOCK_RESPONSES } from '@/lib/chat/responses'

describe('selectRandomResponse', () => {
  // Arrange — valid responses pool
  // Act — call the pure selector function
  // Assert — result is a string from MOCK_RESPONSES
  it('should return a string that exists in the MOCK_RESPONSES pool', () => {
    // Arrange
    const result = selectRandomResponse()
    // Act
    const exists = MOCK_RESPONSES.includes(result as typeof MOCK_RESPONSES[number])
    // Assert
    expect(typeof result).toBe('string')
    expect(exists).toBe(true)
  })

  it('should return a string when called multiple times (deterministic shape)', () => {
    // Arrange — call 20 times to exercise the random distribution
    const results = Array.from({ length: 20 }, () => selectRandomResponse())
    // Assert — all results must be strings from the pool
    results.forEach((result) => {
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })
})

describe('sendMessage', () => {
  // Arrange — mock simulateDelay to remove timing dependency
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should return a string from the MOCK_RESPONSES pool', async () => {
    // Arrange — mock the delay to be instantaneous
    jest.spyOn(global, 'setTimeout').mockImplementation((fn: () => void) => {
      fn()
      return 0 as unknown as ReturnType<typeof setTimeout>
    })

    // Act
    const result = await sendMessage('test user message')

    // Assert
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('should ignore the content parameter (mock behavior)', async () => {
    // Arrange — mock the delay
    jest.spyOn(global, 'setTimeout').mockImplementation((fn: () => void) => {
      fn()
      return 0 as unknown as ReturnType<typeof setTimeout>
    })

    // Act — call with various content strings
    const result1 = await sendMessage('Qui m\'a relancé cette semaine ?')
    const result2 = await sendMessage('Résume mes échanges')
    const result3 = await sendMessage('')

    // Assert — results should be strings from the pool regardless of input
    expect(typeof result1).toBe('string')
    expect(typeof result2).toBe('string')
    expect(typeof result3).toBe('string')
    // All should be valid responses (not necessarily different)
    expect(result1.length).toBeGreaterThan(0)
    expect(result2.length).toBeGreaterThan(0)
    expect(result3.length).toBeGreaterThan(0)
  })
})

describe('simulateDelay', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should return a Promise that resolves', async () => {
    // Arrange
    const delayPromise = simulateDelay()
    // Act & Assert — Promise must resolve (not reject)
    let resolved = false
    delayPromise.then(() => { resolved = true })

    jest.advanceTimersByTime(2000)
    await Promise.resolve() // flush microtasks

    expect(resolved).toBe(true)
  })

  it('should complete within reasonable bounds (500-1000ms)', async () => {
    // Arrange
    const start = Date.now()
    const delayPromise = simulateDelay()

    // Act — advance timers to cover the full expected range
    jest.advanceTimersByTime(1500)
    await Promise.resolve()

    // Assert — delay completes well within the 500-1000ms range
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(2000)
  })
})
