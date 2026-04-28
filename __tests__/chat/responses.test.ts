import { MOCK_RESPONSES, MOCK_RESPONSES_COUNT } from '@/lib/chat/responses'

describe("MOCK_RESPONSES", () => {
  it("should be frozen to prevent mutation", () => {
    expect(Object.isFrozen(MOCK_RESPONSES)).toBe(true)
  })

  it("should have exactly 5 responses as documented", () => {
    expect(MOCK_RESPONSES_COUNT).toBe(5)
    expect(MOCK_RESPONSES.length).toBe(5)
  })

  it("should contain only non-empty string responses", () => {
    MOCK_RESPONSES.forEach((response) => {
      expect(typeof response).toBe('string')
      expect(response.trim().length).toBeGreaterThan(0)
    })
  })

  it("MOCK_RESPONSES_COUNT should equal the actual array length", () => {
    expect(MOCK_RESPONSES_COUNT).toBe(MOCK_RESPONSES.length)
  })

  it("all responses should be in French as required by the product language", () => {
    MOCK_RESPONSES.forEach((response) => {
      expect(response).toMatch(/[àâäéèêëïîôùûüÿçœæ]/i)
    })
  })
})
