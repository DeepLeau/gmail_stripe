import { render, screen } from '@testing-library/react'
import { PlanBadge } from '@/components/chat/PlanBadge'

describe('PlanBadge', () => {
  describe('getBadgeStyle — plan name mapping', () => {
    it('should return accent blue style when planName is "scale"', () => {
      const { container } = render(
        <PlanBadge planName="scale" used={23} limit={50} isLoading={false} />
      )
      const div = container.firstChild as HTMLDivElement
      const style = div.style

      expect(style.backgroundColor).toBe('var(--accent-light)')
      expect(style.color).toBe('var(--accent)')
      expect(style.border).toContain('rgba(59, 130, 246')
    })

    it('should return gradient accent+violet style when planName is "team"', () => {
      const { container } = render(
        <PlanBadge planName="team" used={45} limit={100} isLoading={false} />
      )
      const div = container.firstChild as HTMLDivElement
      const style = div.style

      expect(style.background).toContain('linear-gradient')
      expect(style.background).toContain('var(--accent-light)')
      expect(style.background).toContain('var(--violet-light)')
      expect(style.color).toBe('var(--accent)')
      expect(style.border).toContain('rgba(139, 92, 246')
    })

    it('should return default surface/gray style when planName is "Free"', () => {
      const { container } = render(
        <PlanBadge planName="Free" used={10} limit={100} isLoading={false} />
      )
      const div = container.firstChild as HTMLDivElement
      const style = div.style

      expect(style.backgroundColor).toBe('var(--surface)')
      expect(style.color).toBe('var(--text-2)')
      expect(style.border).toBe('1px solid var(--border)')
    })

    it('should be case-insensitive when comparing planName', () => {
      const { container: c1 } = render(
        <PlanBadge planName="SCALE" used={5} limit={50} isLoading={false} />
      )
      const { container: c2 } = render(
        <PlanBadge planName="Scale" used={5} limit={50} isLoading={false} />
      )

      const style1 = (c1.firstChild as HTMLDivElement).style
      const style2 = (c2.firstChild as HTMLDivElement).style

      expect(style1.backgroundColor).toBe(style2.backgroundColor)
      expect(style1.backgroundColor).toBe('var(--accent-light)')
      expect(style2.backgroundColor).toBe('var(--accent-light)')
    })
  })

  describe('loading state', () => {
    it('should render loading state when isLoading is true', () => {
      render(
        <PlanBadge planName="Scale" used={0} limit={50} isLoading={true} />
      )

      expect(screen.getByText('Chargement...')).toBeTruthy()
      expect(screen.queryByText('Scale')).toBeNull()
      expect(screen.queryByText('/')).toBeNull()
    })
  })
})
