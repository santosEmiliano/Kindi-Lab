import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CharsetRing } from './CharsetRing'

describe('CharsetRing', () => {
  it('renders one decorative card per ring letter and hides it from assistive tech', () => {
    const { container } = render(
      <CharsetRing shift={3} active dimmed={false} />,
    )
    const orbit = container.querySelector('.orbit')
    expect(orbit).toHaveAttribute('aria-hidden', 'true')
    expect(orbit?.querySelectorAll('.orbit-card')).toHaveLength(27)

    const glyphs = orbit?.querySelectorAll('.orbit-card > .orbit-glyph')
    expect(glyphs).toHaveLength(27)
    const shown = [...(glyphs ?? [])].map((g) => g.textContent).sort().join('')
    expect(shown).toBe([...'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'].sort().join(''))
  })

  it('does not throw when idle (Atbash view)', () => {
    expect(() =>
      render(<CharsetRing shift={1} active={false} dimmed />),
    ).not.toThrow()
  })
})
