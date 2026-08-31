import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { expectedSpanish, ringLabels } from '../lib/preview-cipher'
import { Verdict } from './Verdict'

const observed = ringLabels.map(() => 1 / ringLabels.length)

function renderVerdict(detection: Parameters<typeof Verdict>[0]['detection']) {
  render(
    <Verdict
      detection={detection}
      observed={observed}
      expected={expectedSpanish}
      labels={ringLabels}
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
