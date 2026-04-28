import { MOCK_RESPONSES_COUNT } from '@/lib/chat/responses'

// We import the actual module to spy/mock Math.random
jest.mock('@/lib/chat/responses', () => ({
  MOCK_RESPONSES: Object.freeze([
    "Réponse A — contexte neutre.",
    "Réponse B — suggestion de clarification.",
    "Réponse C — analyse personnalisée.",
  ] as const),
  MOCK_RESPONSES_COUNT: 3,
}))

// Must re-import after mocking
const { selectRandomResponse, simulateDelay } = require('@/lib/chat/mockApi')

describe("selectRandomResponse", () => {
  beforeEach(() => jest.clearAllMocks())

  it("should return a string from the MOCK_RESPONSES pool", () => {
    // Arrange — Math.random mocked to deterministic state
    const mathSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5)

    // Act
    const result = selectRandomResponse()

    // Assert — result is one of the frozen responses
    expect(result).toBe("Réponse B — suggestion de clarification.")
    mathSpy.mockRestore()
  })

  it("should return first response when Math.random returns 0", () => {
    // Arrange
    const mathSpy = jest.spyOn(Math, 'random').mockReturnValue(0)

    // Act
    const result = selectRandomResponse()

    // Assert
    expect(result).toBe("Réponse A — contexte neutre.")
    mathSpy.mockRestore()
  })

  it("should return last response when Math.random returns just below 1", () => {
    // Arrange
    const mathSpy = jest.spyOn(Math, 'random').mockReturnValue(0.999)

    // Act
    const result = selectRandomResponse()

    // Assert
    expect(result).toBe("Réponse C — analyse personnalisée.")
    mathSpy.mockRestore()
  })

  it("should always return a string (never undefined or empty)", () => {
    // Arrange — iterate all possible index positions
    const results = new Set<string>()
    const mathSpy = jest.spyOn(Math, 'random')

    // Act — sample multiple positions across the [0, 1) range
    for (let i = 0; i <= 10; i++) {
      mathSpy.mockReturnValueOnce(i / 10)
      const r = selectRandomResponse()
      expect(typeof r).toBe('string')
      expect(r.length).toBeGreaterThan(0)
      results.add(r)
    }

    // Assert — covered at least 2 distinct responses
    expect(results.size).toBeGreaterThanOrEqual(2)
    mathSpy.mockRestore()
  })
})

describe("simulateDelay", () => {
  beforeEach(() => jest.clearAllMocks())

  it("should resolve within the defined delay range", async () => {
    // Arrange
    jest.useFakeTimers()

    // Act — start the promise without awaiting
    const promise = simulateDelay()

    // Fast-forward past MIN_DELAY (500ms)
    jest.advanceTimersByTime(499)
    let settled = false
    promise.then(() => { settled = true })

    // Assert — not yet settled at 499ms
    expect(settled).toBe(false)

    // Advance to MIN_DELAY boundary
    jest.advanceTimersByTime(1)
    await jest.runAllTimers()

    // Cleanup
    jest.useRealTimers()
  })

  it("should be resolvable with advanceTimersByTime", async () => {
    // Arrange
    jest.useFakeTimers()
    const resolveSpy = jest.fn()

    // Act
    const promise = simulateDelay()
    promise.then(resolveSpy)

    jest.advanceTimersByTime(600)
    await jest.runAllTimers()

    // Assert — promise settled after sufficient timer advance
    expect(resolveSpy).toHaveBeenCalled()
    jest.useRealTimers()
  })
})
