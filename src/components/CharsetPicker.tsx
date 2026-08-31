import './CharsetPicker.css'
import {
  type CharsetPreset,
  CUSTOM_CHARSET_ID,
} from '../lib/preview-charset'

interface CharsetPickerProps {
  presets: readonly CharsetPreset[]
  value: string
  customChars: string
  error: string | null
  onValueChange: (id: string) => void
  onCustomChange: (chars: string) => void
}

export function CharsetPicker({
  presets,
  value,
  customChars,
  error,
  onValueChange,
  onCustomChange,
}: CharsetPickerProps) {
  return (
    <div className="charset">
      <label className="charset-select">
        <span>Alfabeto</span>
        <select value={value} onChange={(event) => onValueChange(event.target.value)}>
          {presets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
          <option value={CUSTOM_CHARSET_ID}>Personalizado</option>
        </select>
      </label>

      {value === CUSTOM_CHARSET_ID && (
        <input
          className="charset-custom"
          type="text"
          spellCheck={false}
          autoComplete="off"
          value={customChars}
          onChange={(event) => onCustomChange(event.target.value)}
          placeholder="ABCDEFGHIJKLMNÑOPQRSTUVWXYZ"
          aria-label="Caracteres del alfabeto"
          aria-invalid={error ? true : undefined}
        />
      )}

      {error && (
        <span className="charset-error" role="status">
          {error}
        </span>
      )}
    </div>
  )
}
