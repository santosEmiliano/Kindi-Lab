import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MirrorBand } from './MirrorBand'

describe('MirrorBand', () => {
  it('renders two seamless passes of the alphabet, hidden from assistive tech', () => {
    const { container } = render(<MirrorBand />)
    const mirror = container.querySelector('.mirror')
    expect(mirror).toHaveAttribute('aria-hidden', 'true')
    expect(mirror?.querySelectorAll('.cell')).toHaveLength(54)
  })

  it('pairs each letter with its Atbash mapping', () => {
    const { container } = render(<MirrorBand />)
    const cells = container.querySelectorAll('.cell')

    const first = cells[0]
    expect(first.querySelector('.top')?.textContent).toBe('A')
    expect(first.querySelector('.bot')?.textContent).toBe('Z')

    const middle = cells[13]
    expect(middle.querySelector('.top')?.textContent).toBe('N')
    expect(middle.querySelector('.bot')?.textContent).toBe('N')
  })
})
