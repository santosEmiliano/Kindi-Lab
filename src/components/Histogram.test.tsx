import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { HISTOGRAM_LABELS } from '../lib/letter-histogram'
import { Histogram } from './Histogram'

const observed = HISTOGRAM_LABELS.map((_, index) => (index === 4 ? 0.2 : 0.03))
const expected = HISTOGRAM_LABELS.map(() => 0.04)

describe('Histogram', () => {
  it('draws one bar per ring letter', () => {
    const { container } = render(
      <Histogram observed={observed} expected={expected} labels={HISTOGRAM_LABELS} />,
    )
    expect(container.querySelectorAll('.hist-bar')).toHaveLength(
      HISTOGRAM_LABELS.length,
    )
  })

  it('reveals a per-letter tooltip on hover', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Histogram observed={observed} expected={expected} labels={HISTOGRAM_LABELS} />,
    )
    const bands = container.querySelectorAll('svg > rect[fill="transparent"]')

    await user.hover(bands[4])
    const tip = container.querySelector('.hist-tip')
    expect(tip).toBeInTheDocument()
    expect(tip?.querySelector('.hist-tip-letter')?.textContent).toBe('E')
    expect(tip?.textContent).toContain('20.0%')
  })
})
