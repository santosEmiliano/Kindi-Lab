import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

vi.mock('./lib/spanish-data', () => ({
  loadSpanishData: vi.fn(() =>
    Promise.resolve({
      quadgrams: {
        order: 4,
        alphabet: 'abcdefghijklmnopqrstuvwxyz',
        floorLog10: -9.5,
        logProbs: new Float32Array(0),
        logProb: () => -3,
      },
      words: new Set<string>(),
      letterFrequencies: Object.fromEntries(
        Array.from({ length: 26 }, (_, i) => [
          String.fromCharCode(97 + i),
          1 / 26,
        ]),
      ),
    }),
  ),
}))

afterEach(() => {
  document.documentElement.removeAttribute('data-theme')
  localStorage.clear()
})

describe('App shell', () => {
  it('renders the stage backdrop and a main landmark', () => {
    const { container } = render(<App />)
    expect(container.querySelector('.stage')).toBeInTheDocument()
    expect(container.querySelector('.glow')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('toggles the color theme and persists the choice', async () => {
    const user = userEvent.setup()
    render(<App />)
    const toggle = screen.getByRole('button', { name: /modo (claro|oscuro)/i })

    await user.click(toggle)
    const first = document.documentElement.getAttribute('data-theme')
    expect(first).toMatch(/^(light|dark)$/)
    expect(localStorage.getItem('kindi-theme')).toBe(first)

    await user.click(toggle)
    const second = document.documentElement.getAttribute('data-theme')
    expect(second).not.toBe(first)
    expect(localStorage.getItem('kindi-theme')).toBe(second)
  })

  it('loads the Spanish data and renders a verdict on decrypt', async () => {
    const user = userEvent.setup()
    const { loadSpanishData } = await import('./lib/spanish-data')
    render(<App />)

    await user.selectOptions(screen.getByLabelText('Acción'), 'decrypt')
    await user.click(screen.getByRole('button', { name: 'Descifrar' }))

    expect(await screen.findByText('Texto descifrado')).toBeInTheDocument()
    expect(loadSpanishData).toHaveBeenCalled()
  })
})
