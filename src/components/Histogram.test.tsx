import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { expectedSpanish, ringLabels } from '../lib/preview-cipher'
import { Histogram } from './Histogram'

const observed = ringLabels.map((_, index) => (index === 4 ? 0.2 : 0.03))

describe('Histogram', () => {
  it('draws one bar per ring letter', () => {
    const { container } = render(
      <Histogram observed={observed} expected={expectedSpanish} labels={ringLabels} />,
    )
    expect(container.querySelectorAll('.hist-bar')).toHaveLength(ringLabels.length)
  })

  it('reveals a per-letter tooltip on hover', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Histogram observed={observed} expected={expectedSpanish} labels={ringLabels} />,
    )
    const bands = container.querySelectorAll('svg > rect[fill="transparent"]')

    await user.hover(bands[4])
    const tip = container.querySelector('.hist-tip')
    expect(tip).toBeInTheDocument()
    expect(tip?.querySelector('.hist-tip-letter')?.textContent).toBe('E')
    expect(tip?.textContent).toContain('20.0%')
  })
})
