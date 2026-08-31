import './Subrow.css'
import type { Method, Mode } from '../types'

interface SubrowProps {
  mode: Mode
  method: Method
  shift: number
  ringSize: number
  onShiftChange: (value: number) => void
}

const MIN_SHIFT = 1

function hintFor(mode: Mode, method: Method, ringSize: number): string | null {
  if (mode === 'decrypt') {
    return `Kindi Lab prueba las ${ringSize} posibilidades y elige una.`
  }
  if (method === 'atbash') return 'Atbash no usa llave: refleja el alfabeto.'
  return null
}

export function Subrow({ mode, method, shift, ringSize, onShiftChange }: SubrowProps) {
  const maxShift = ringSize - 1
  const showStepper = mode === 'encrypt' && method === 'caesar' && maxShift >= MIN_SHIFT
  const hint = hintFor(mode, method, ringSize)

  const step = (delta: number) => {
    const next = shift + delta
    if (next > maxShift) onShiftChange(MIN_SHIFT)
    else if (next < MIN_SHIFT) onShiftChange(maxShift)
    else onShiftChange(next)
  }

  return (
    <div className="subrow">
      {showStepper && (
        <div className="stepper">
          <span className="lbl">Desplazamiento</span>
          <button type="button" onClick={() => step(-1)} aria-label="Restar uno">
            −
          </button>
          <span className="k" aria-live="polite">
            {shift}
          </span>
          <button type="button" onClick={() => step(1)} aria-label="Sumar uno">
            +
          </button>
        </div>
      )}
      {hint && <span>{hint}</span>}
    </div>
  )
}
