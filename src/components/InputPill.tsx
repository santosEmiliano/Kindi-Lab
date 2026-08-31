import './InputPill.css'
import type { Method, Mode } from '../types'

interface InputPillProps {
  mode: Mode
  method: Method
  text: string
  onTextChange: (value: string) => void
  onMethodChange: (value: Method) => void
  onModeChange: (value: Mode) => void
}

export function InputPill({
  mode,
  method,
  text,
  onTextChange,
  onMethodChange,
  onModeChange,
}: InputPillProps) {
  const decrypt = mode === 'decrypt'

  return (
    <div className="pill">
      <input
        className="text"
        type="text"
        spellCheck={false}
        autoComplete="off"
        value={text}
        placeholder={decrypt ? 'Pega el texto cifrado…' : 'Escribe una frase…'}
        onChange={(event) => onTextChange(event.target.value)}
      />

      <span className="sep" aria-hidden="true" />

      {decrypt ? (
        <span className="auto-pill">Detección automática</span>
      ) : (
        <span className="selwrap">
          <select
            aria-label="Método"
            value={method}
            onChange={(event) => onMethodChange(event.target.value as Method)}
          >
            <option value="caesar">César</option>
            <option value="atbash">Atbash</option>
          </select>
        </span>
      )}

      <span className="sep" aria-hidden="true" />

      <span className="selwrap">
        <select
          aria-label="Acción"
          value={mode}
          onChange={(event) => onModeChange(event.target.value as Mode)}
        >
          <option value="encrypt">Cifrar</option>
          <option value="decrypt">Descifrar</option>
        </select>
      </span>

      <button className="run" type="button" aria-label={decrypt ? 'Descifrar' : 'Cifrar'}>
        ▶
      </button>
    </div>
  )
}
