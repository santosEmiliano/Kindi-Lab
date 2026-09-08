import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MirrorBand } from './MirrorBand'
import { MAX_VISIBLE_CARDS } from './ring-window'

const ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('')
const oversized = Array.from({ length: MAX_VISIBLE_CARDS + 70 }, (_, i) =>
  String.fromCodePoint(0x4e00 + i),
)

describe('MirrorBand', () => {
  it('renders two seamless passes of the charset, hidden from assistive tech', () => {
    const { container } = render(<MirrorBand letters={ALPHABET} />)
    const mirror = container.querySelector('.mirror')
    expect(mirror).toHaveAttribute('aria-hidden', 'true')
    expect(mirror?.querySelectorAll('.cell')).toHaveLength(54)
  })

  it('pairs each character with its reversed-ring mapping', () => {
    const { container } = render(<MirrorBand letters={ALPHABET} />)
    const cells = container.querySelectorAll('.cell')

    expect(cells[0].querySelector('.top')?.textContent).toBe('A')
    expect(cells[0].querySelector('.bot')?.textContent).toBe('Z')

    expect(cells[13].querySelector('.top')?.textContent).toBe('N')
    expect(cells[13].querySelector('.bot')?.textContent).toBe('N')
  })

  it('follows a custom charset length', () => {
    const { container } = render(<MirrorBand letters={['A', 'B', 'C']} />)
    expect(container.querySelectorAll('.cell')).toHaveLength(6)
    expect(container.querySelector('.cell .bot')?.textContent).toBe('C')
  })

  it('caps the band at MAX_VISIBLE_CARDS pairs but keeps true Atbash partners', () => {
    const { container } = render(<MirrorBand letters={oversized} />)
    const cells = container.querySelectorAll('.cell')
    expect(cells).toHaveLength(MAX_VISIBLE_CARDS * 2)
    expect(cells[0].querySelector('.top')?.textContent).toBe(oversized[0])
    expect(cells[0].querySelector('.bot')?.textContent).toBe(
      oversized[oversized.length - 1],
    )
  })
})
