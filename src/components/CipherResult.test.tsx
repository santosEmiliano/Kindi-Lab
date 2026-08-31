import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { CipherResult } from './CipherResult'

describe('CipherResult', () => {
  it('shows the ciphertext value', () => {
    render(<CipherResult value="Hñ vdehu" />)
    expect(screen.getByText('Hñ vdehu')).toBeInTheDocument()
  })

  it('disables copy when there is nothing to copy', () => {
    render(<CipherResult value="" />)
    expect(screen.getByRole('button', { name: 'Copiar' })).toBeDisabled()
  })

  it('copies to the clipboard and confirms', async () => {
    const user = userEvent.setup()
    render(<CipherResult value="Hñ vdehu" />)

    await user.click(screen.getByRole('button', { name: 'Copiar' }))

    expect(await navigator.clipboard.readText()).toBe('Hñ vdehu')
    expect(screen.getByRole('button', { name: 'Copiado' })).toBeInTheDocument()
  })
})
