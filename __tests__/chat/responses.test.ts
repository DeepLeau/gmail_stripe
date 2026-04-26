/**
 * Unit tests for src/lib/chat/responses.ts
 *
 * Tests the static data pool used by the mock chat API.
 * Pattern: AAA (Arrange → Act → Assert)
 */

import { MOCK_RESPONSES, MOCK_RESPONSES_COUNT } from '@/lib/chat/responses'

describe('responses', () => {
  describe('MOCK_RESPONSES_COUNT', () => {
    it('should equal the actual length of MOCK_RESPONSES', () => {
      // Assert — shape of the data pool
      expect(MOCK_RESPONSES_COUNT).toBe(MOCK_RESPONSES.length)
    })

    it('should be a positive integer (pool is not empty)', () => {
      // Assert — pool must contain at least one response
      expect(MOCK_RESPONSES_COUNT).toBeGreaterThan(0)
    })
  })

  describe('MOCK_RESPONSES — data shape', () => {
    it('should contain only string values', () => {
      // Arrange — iterate over every item in the pool
      for (const response of MOCK_RESPONSES) {
        // Assert — each item must be a non-empty string
        expect(typeof response).toBe('string')
        expect(response.trim().length).toBeGreaterThan(0)
      }
    })

    it('should be frozen to prevent accidental mutation', () => {
      // Assert — Object.freeze makes the array non-extensible
      expect(Object.isFrozen(MOCK_RESPONSES)).toBe(true)
    })

    it('should contain responses in French as expected for the product', () => {
      // Assert — every response should contain French characters
      // (product is a French email assistant)
      for (const response of MOCK_RESPONSES) {
        const hasFrench = /[àâäéèêëïîôùûüçœæ]|['"]/.test(response)
        expect(hasFrench).toBe(true)
      }
    })
  })
})
