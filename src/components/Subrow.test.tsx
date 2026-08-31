import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Subrow } from './Subrow'

const noop = () => undefined

describe('Subrow', () => {
  it('shows the shift stepper only when encrypting with Caesar', () => {
    const { rerender } = render(
      <Subrow mode="encrypt" method="caesar" shift={3} ringSize={27} onShiftChange={noop} />,
    )
    expect(screen.getByText('Desplazamiento')).toBeInTheDocument()

    rerender(
      <Subrow mode="encrypt" method="atbash" shift={3} ringSize={27} onShiftChange={noop} />,
    )
    expect(screen.queryByText('Desplazamiento')).not.toBeInTheDocument()
    expect(screen.getByText(/Atbash no usa llave/)).toBeInTheDocument()

    rerender(
      <Subrow mode="decrypt" method="caesar" shift={3} ringSize={27} onShiftChange={noop} />,
    )
    expect(screen.queryByText('Desplazamiento')).not.toBeInTheDocument()
    expect(screen.getByText(/prueba las 27 posibilidades/)).toBeInTheDocument()
  })

  it('derives the decrypt note count from the charset size', () => {
    render(
      <Subrow mode="decrypt" method="caesar" shift={3} ringSize={95} onShiftChange={noop} />,
    )
    expect(screen.getByText(/prueba las 95 posibilidades/)).toBeInTheDocument()
  })

  it('wraps the shift value around the 1..ringSize-1 range', async () => {
    const user = userEvent.setup()
    const onShiftChange = vi.fn()

    const { rerender } = render(
      <Subrow
        mode="encrypt"
        method="caesar"
        shift={9}
        ringSize={10}
        onShiftChange={onShiftChange}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Sumar uno' }))
    expect(onShiftChange).toHaveBeenLastCalledWith(1)

    rerender(
      <Subrow
        mode="encrypt"
        method="caesar"
        shift={1}
        ringSize={10}
        onShiftChange={onShiftChange}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Restar uno' }))
    expect(onShiftChange).toHaveBeenLastCalledWith(9)
  })

  it('hides the stepper when the ring is too small to shift', () => {
    render(
      <Subrow mode="encrypt" method="caesar" shift={1} ringSize={1} onShiftChange={noop} />,
    )
    expect(screen.queryByText('Desplazamiento')).not.toBeInTheDocument()
  })
})
