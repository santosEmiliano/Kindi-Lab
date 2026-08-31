import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { HISTOGRAM_LABELS } from '../lib/letter-histogram'
import { Verdict } from './Verdict'

const observed = HISTOGRAM_LABELS.map(() => 1 / HISTOGRAM_LABELS.length)
const expected = HISTOGRAM_LABELS.map(() => 1 / HISTOGRAM_LABELS.length)

type Detection = Parameters<typeof Verdict>[0]['detection']

const detection = (
  overrides: Pick<Detection, 'plaintext' | 'method' | 'shift' | 'confidence'>,
): Detection => ({ quadgramScore: -1.5, wordRatio: 0.8, ...overrides })

function renderVerdict(over: Parameters<typeof detection>[0]) {
  render(
    <Verdict
      detection={detection(over)}
      observed={observed}
      expected={expected}
      labels={HISTOGRAM_LABELS}
    />,
  )
}

describe('Verdict', () => {
  it('renders the plaintext and a Caesar badge with the shift', () => {
    renderVerdict({
      plaintext: 'la escritura secreta',
      method: 'caesar',
      shift: 7,
      confidence: 0.9,
    })
    expect(screen.getByText('la escritura secreta')).toBeInTheDocument()
    expect(screen.getByText('César · desplazamiento 7')).toBeInTheDocument()
    expect(screen.getByText('alta · 90%')).toBeInTheDocument()
  })

  it('announces the readout politely without reading out the chart', () => {
    const { container } = render(
      <Verdict
        detection={detection({
          plaintext: 'la escritura secreta',
          method: 'caesar',
          shift: 7,
          confidence: 0.9,
        })}
        observed={observed}
        expected={expected}
        labels={HISTOGRAM_LABELS}
      />,
    )
    const live = container.querySelector('[aria-live="polite"]')
    expect(live).toHaveClass('verdict-readout')
    expect(live?.querySelector('details')).toBeNull()
  })

  it('labels a low-confidence Atbash reading without a key', () => {
    renderVerdict({
      plaintext: 'texto corto',
      method: 'atbash',
      shift: null,
      confidence: 0.2,
    })
    expect(screen.getByText('Atbash · sin llave')).toBeInTheDocument()
    expect(screen.getByText('baja · 20%')).toBeInTheDocument()
  })

  it('keeps the frequency chart behind a collapsed disclosure', async () => {
    const user = userEvent.setup()
    renderVerdict({
      plaintext: 'la escritura secreta',
      method: 'caesar',
      shift: 7,
      confidence: 0.9,
    })
    const summary = screen.getByText('Ver análisis de frecuencias')
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument()

    await user.click(summary)
    expect(summary.closest('details')).toHaveAttribute('open')
  })
})
