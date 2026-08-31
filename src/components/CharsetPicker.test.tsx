import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CHARSET_PRESETS } from '../lib/preview-charset'
import { CharsetPicker } from './CharsetPicker'

const noop = () => undefined

function setup(overrides: Partial<Parameters<typeof CharsetPicker>[0]> = {}) {
  const props = {
    presets: CHARSET_PRESETS,
    value: CHARSET_PRESETS[0].id,
    customChars: '',
    error: null as string | null,
    onValueChange: noop,
    onCustomChange: noop,
    ...overrides,
  }
  render(<CharsetPicker {...props} />)
  return props
}

describe('CharsetPicker', () => {
  it('lists every preset plus a custom option', () => {
    setup()
    const select = screen.getByLabelText('Alfabeto') as HTMLSelectElement
    const optionValues = [...select.options].map((option) => option.value)
    expect(optionValues).toEqual([
      ...CHARSET_PRESETS.map((preset) => preset.id),
      'custom',
    ])
  })

  it('reveals the custom-characters input only for the custom option', () => {
    const { rerender } = render(
      <CharsetPicker
        presets={CHARSET_PRESETS}
        value={CHARSET_PRESETS[0].id}
        customChars=""
        error={null}
        onValueChange={noop}
        onCustomChange={noop}
      />,
    )
    expect(screen.queryByLabelText('Caracteres del alfabeto')).not.toBeInTheDocument()

    rerender(
      <CharsetPicker
        presets={CHARSET_PRESETS}
        value="custom"
        customChars="ABC"
        error={null}
        onValueChange={noop}
        onCustomChange={noop}
      />,
    )
    expect(screen.getByLabelText('Caracteres del alfabeto')).toHaveValue('ABC')
  })

  it('marks the custom input invalid and shows the error text', () => {
    setup({ value: 'custom', customChars: 'A', error: 'El alfabeto necesita al menos 2 caracteres distintos.' })
    expect(screen.getByLabelText('Caracteres del alfabeto')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(screen.getByRole('status')).toHaveTextContent(/al menos 2/)
  })

  it('reports preset and custom edits', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const onCustomChange = vi.fn()
    setup({ value: 'custom', customChars: '', onValueChange, onCustomChange })

    await user.selectOptions(screen.getByLabelText('Alfabeto'), 'ascii-printable')
    expect(onValueChange).toHaveBeenCalledWith('ascii-printable')

    await user.type(screen.getByLabelText('Caracteres del alfabeto'), 'Z')
    expect(onCustomChange).toHaveBeenCalledWith('Z')
  })
})
