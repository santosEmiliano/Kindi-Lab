import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { InputPill } from './InputPill'

const noop = () => undefined

function setup(overrides: Partial<Parameters<typeof InputPill>[0]> = {}) {
  const props = {
    mode: 'encrypt' as const,
    method: 'caesar' as const,
    text: 'hola',
    onTextChange: noop,
    onMethodChange: noop,
    onModeChange: noop,
    onRun: noop,
    ...overrides,
  }
  render(<InputPill {...props} />)
  return props
}

describe('InputPill', () => {
  it('shows the method selector and a "Cifrar" run button in encrypt mode', () => {
    setup()
    expect(screen.getByLabelText('Método')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cifrar' })).toBeInTheDocument()
    expect(screen.queryByText('Detección automática')).not.toBeInTheDocument()
  })

  it('replaces the method selector with the auto-detect chip in decrypt mode', () => {
    setup({ mode: 'decrypt' })
    expect(screen.queryByLabelText('Método')).not.toBeInTheDocument()
    expect(screen.getByText('Detección automática')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Descifrar' })).toBeInTheDocument()
  })

  it('reports edits to the phrase and the action', async () => {
    const user = userEvent.setup()
    const onTextChange = vi.fn()
    const onModeChange = vi.fn()
    setup({ text: '', onTextChange, onModeChange })

    await user.type(screen.getByPlaceholderText('Escribe una frase…'), 'x')
    expect(onTextChange).toHaveBeenCalledWith('x')

    await user.selectOptions(screen.getByLabelText('Acción'), 'decrypt')
    expect(onModeChange).toHaveBeenCalledWith('decrypt')
  })

  it('fires onRun when the run button is pressed', async () => {
    const user = userEvent.setup()
    const onRun = vi.fn()
    setup({ mode: 'decrypt', onRun })

    await user.click(screen.getByRole('button', { name: 'Descifrar' }))
    expect(onRun).toHaveBeenCalledOnce()
  })
})
