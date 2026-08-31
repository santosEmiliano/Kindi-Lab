import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

afterEach(() => {
  document.documentElement.removeAttribute('data-theme')
  localStorage.clear()
})

describe('App shell', () => {
  it('renders the stage backdrop', () => {
    const { container } = render(<App />)
    expect(container.querySelector('.stage')).toBeInTheDocument()
    expect(container.querySelector('.glow')).toBeInTheDocument()
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
})
