import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Subrow } from './Subrow'

describe('Subrow', () => {
  it('shows the shift stepper only when encrypting with Caesar', () => {
    const { rerender } = render(
      <Subrow mode="encrypt" method="caesar" shift={3} onShiftChange={() => undefined} />,
    )
    expect(screen.getByText('Desplazamiento')).toBeInTheDocument()

    rerender(
      <Subrow mode="encrypt" method="atbash" shift={3} onShiftChange={() => undefined} />,
    )
    expect(screen.queryByText('Desplazamiento')).not.toBeInTheDocument()
    expect(screen.getByText(/Atbash no usa llave/)).toBeInTheDocument()

    rerender(
      <Subrow mode="decrypt" method="caesar" shift={3} onShiftChange={() => undefined} />,
    )
    expect(screen.queryByText('Desplazamiento')).not.toBeInTheDocument()
    expect(screen.getByText(/prueba las 27 posibilidades/)).toBeInTheDocument()
  })

  it('wraps the shift value around the 1–26 range', async () => {
    const user = userEvent.setup()
    const onShiftChange = vi.fn()

    const { rerender } = render(
      <Subrow mode="encrypt" method="caesar" shift={26} onShiftChange={onShiftChange} />,
    )
    await user.click(screen.getByRole('button', { name: 'Sumar uno' }))
    expect(onShiftChange).toHaveBeenLastCalledWith(1)

    rerender(
      <Subrow mode="encrypt" method="caesar" shift={1} onShiftChange={onShiftChange} />,
    )
    await user.click(screen.getByRole('button', { name: 'Restar uno' }))
    expect(onShiftChange).toHaveBeenLastCalledWith(26)
  })
})
