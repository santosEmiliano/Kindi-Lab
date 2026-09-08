import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CharsetRing } from './CharsetRing'
import { MAX_VISIBLE_CARDS } from './ring-window'

const ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('')
const oversized = Array.from({ length: MAX_VISIBLE_CARDS + 70 }, (_, i) =>
  String.fromCodePoint(0x4e00 + i),
)

describe('CharsetRing', () => {
  it('renders one decorative card per charset character, hidden from assistive tech', () => {
    const { container } = render(
      <CharsetRing letters={ALPHABET} shift={3} active dimmed={false} />,
    )
    const orbit = container.querySelector('.orbit')
    expect(orbit).toHaveAttribute('aria-hidden', 'true')
    expect(orbit?.querySelectorAll('.orbit-card')).toHaveLength(27)

    const glyphs = orbit?.querySelectorAll('.orbit-card > .orbit-glyph')
    expect(glyphs).toHaveLength(27)
    const shown = [...(glyphs ?? [])].map((g) => g.textContent).sort().join('')
    expect(shown).toBe([...ALPHABET].sort().join(''))
  })

  it('tracks the charset length', () => {
    const { container } = render(
      <CharsetRing letters={['A', 'B', 'C', 'D']} shift={1} active dimmed={false} />,
    )
    expect(container.querySelectorAll('.orbit-card')).toHaveLength(4)
  })

  it('does not throw for an empty charset', () => {
    expect(() =>
      render(<CharsetRing letters={[]} shift={1} active={false} dimmed />),
    ).not.toThrow()
  })

  it('caps the orbit at MAX_VISIBLE_CARDS for an oversized charset', () => {
    const { container } = render(
      <CharsetRing letters={oversized} shift={3} active dimmed={false} />,
    )
    expect(container.querySelectorAll('.orbit-card')).toHaveLength(
      MAX_VISIBLE_CARDS,
    )
  })
})
