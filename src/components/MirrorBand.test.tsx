import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MirrorBand } from './MirrorBand'

const ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('')

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
})
