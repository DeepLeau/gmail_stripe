/**
 * Unit tests for src/lib/chat/mockApi.ts
 *
 * Targets three pure functions exported from the mock API module:
 *   - simulateDelay()
 *   - selectRandomResponse()
 *   - sendMessage()
 *
 * Pattern: AAA (Arrange → Act → Assert)
 *
 * Note: simulateDelay and selectRandomResponse are tested in isolation.
 * sendMessage is an async function that chains them; we use fake timers
 * to avoid real delays in the test suite.
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import { MOCK_RESPONSES, MOCK_RESPONSES_COUNT } from '@/lib/chat/responses'

// Re-export so the test file can import them
import {
  simulateDelay,
  selectRandomResponse,
  sendMessage,
} from '@/lib/chat/mockApi'

describe('mockApi', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ─── simulateDelay ─────────────────────────────────────────────────────────

  describe('simulateDelay', () => {
    it('should return a Promise that resolves', async () => {
      // Arrange
      const result = simulateDelay()
      // Assert — returned value is a Promise
      expect(result).toBeInstanceOf(Promise)
      // Act — wait for it to settle
      await expect(result).resolves.toBeUndefined()
    })

    it('should resolve in a bounded range between 500ms and 1000ms', async () => {
      // Arrange
      jest.useFakeTimers()
      const delayPromise = simulateDelay()

      // Act — advance past the minimum delay
      jest.advanceTimersByTime(500)
      // Assert — still pending at 500ms (min is 500ms)
      let settled = false
      delayPromise.then(() => { settled = true })

      await Promise.resolve() // flush microtasks
      expect(settled).toBe(false)

      // Act — advance to 1000ms (max delay)
      jest.advanceTimersByTime(500)
      await Promise.resolve()

      // Assert — resolved by 1000ms
      await expect(delayPromise).resolves.toBeUndefined()

      jest.useRealTimers()
    })
  })

  // ─── selectRandomResponse ─────────────────────────────────────────────────

  describe('selectRandomResponse', () => {
    it('should always return a string from the MOCK_RESPONSES pool', () => {
      // Arrange — run multiple times to increase confidence across random calls
      const results = new Set<string>()
      for (let i = 0; i < 100; i++) {
        results.add(selectRandomResponse())
      }

      // Assert — every result is a member of the pool
      for (const result of results) {
        expect(MOCK_RESPONSES).toContain(result)
      }
    })

    it('should return values within the valid index bounds [0, COUNT-1]', () => {
      // This is validated indirectly: the function always indexes into
      // MOCK_RESPONSES, which has length MOCK_RESPONSES_COUNT.
      // After 100 calls all values should be valid pool members.
      for (let i = 0; i < 100; i++) {
        const result = selectRandomResponse()
        expect(result).toBeTruthy()
        expect(typeof result).toBe('string')
      }
    })
  })

  // ─── sendMessage ──────────────────────────────────────────────────────────

  describe('sendMessage', () => {
    it('should return a Promise', () => {
      // Arrange
      const result = sendMessage('test question')
      // Assert
      expect(result).toBeInstanceOf(Promise)
    })

    it('should resolve to a non-empty string', async () => {
      // Arrange
      jest.useFakeTimers()
      const pending = sendMessage('test question')

      // Act — fast-forward past the maximum simulated delay
      jest.advanceTimersByTime(1000)
      await Promise.resolve()

      // Assert — resolved value is a non-empty string from the pool
      const resolved = await pending
      expect(typeof resolved).toBe('string')
      expect(resolved.trim().length).toBeGreaterThan(0)

      jest.useRealTimers()
    })

    it('should resolve to a value that exists in MOCK_RESPONSES', async () => {
      // Arrange
      jest.useFakeTimers()
      const pending = sendMessage('any question content')

      // Act
      jest.advanceTimersByTime(1000)
      const resolved = await pending

      // Assert
      expect(MOCK_RESPONSES).toContain(resolved)

      jest.useRealTimers()
    })

    it('should ignore the content parameter (mock ignores input)', async () => {
      // Arrange — two different questions
      jest.useFakeTimers()

      const p1 = sendMessage('Qui m\'a relancé cette semaine ?')
      jest.advanceTimersByTime(1000)
      const r1 = await p1

      const p2 = sendMessage('Résumé mes échanges avec Marc')
      jest.advanceTimersByTime(1000)
      const r2 = await p2

      // Assert — both resolve to valid pool members (input is ignored in mock)
      expect(MOCK_RESPONSES).toContain(r1)
      expect(MOCK_RESPONSES).toContain(r2)

      jest.useRealTimers()
    })
  })
})
