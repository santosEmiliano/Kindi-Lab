import './Subrow.css'
import type { Method, Mode } from '../types'

interface SubrowProps {
  mode: Mode
  method: Method
  shift: number
  onShiftChange: (value: number) => void
}

const MIN_SHIFT = 1
const MAX_SHIFT = 26

function hintFor(mode: Mode, method: Method): string | null {
  if (mode === 'decrypt') return 'Kindi Lab prueba las 27 posibilidades y elige una.'
  if (method === 'atbash') return 'Atbash no usa llave: refleja el alfabeto.'
  return null
}

export function Subrow({ mode, method, shift, onShiftChange }: SubrowProps) {
  const showStepper = mode === 'encrypt' && method === 'caesar'
  const hint = hintFor(mode, method)

  const step = (delta: number) => {
    const next = shift + delta
    if (next > MAX_SHIFT) onShiftChange(MIN_SHIFT)
    else if (next < MIN_SHIFT) onShiftChange(MAX_SHIFT)
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
