import { render, screen } from '@testing-library/react'
import { SignupPrompt } from '@/components/sections/SignupPrompt'

describe('SignupPrompt', () => {
  describe('business logic — show CTA vs limit message', () => {
    it('should show CTA when messagesLimit is greater than 0', () => {
      const { container } = render(
        <SignupPrompt sessionId="session_abc123" planName="scale" messagesLimit={50} />
      )
      const html = container.innerHTML

      expect(html).toContain('scale')
      expect(html.toLowerCase()).toMatch(/upgrade|passed?|plan|superieur|sup/i)
    })

    it('should return null when messagesLimit is 0', () => {
      const { container } = render(
        <SignupPrompt sessionId="session_abc123" planName="scale" messagesLimit={0} />
      )

      // When messagesLimit is 0, !messagesLimit is true → component returns null
      expect(container.firstChild).toBeNull()
    })

    it('should display the plan name in the component output', () => {
      const { container } = render(
        <SignupPrompt sessionId="session_xyz" planName="team" messagesLimit={100} />
      )

      expect(container.innerHTML).toContain('team')
    })

    it('should return null when any required prop is missing', () => {
      const { container: c1 } = render(
        <SignupPrompt sessionId={null as any} planName="scale" messagesLimit={50} />
      )
      const { container: c2 } = render(
        <SignupPrompt sessionId="session_xyz" planName={null as any} messagesLimit={50} />
      )

      expect(c1.firstChild).toBeNull()
      expect(c2.firstChild).toBeNull()
    })
  })
})
