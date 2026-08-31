import { CHARSET_PRESETS, type CharsetPresetId } from './charset'

export const CUSTOM_CHARSET_ID = 'custom'
export const DEFAULT_CHARSET_ID: CharsetPresetId = 'spanish-upper'
export const MIN_RING_SIZE = 2

export interface CharsetOption {
  id: string
  label: string
  chars: string
}

export const PRESET_OPTIONS: readonly CharsetOption[] = Object.entries(
  CHARSET_PRESETS,
).map(([id, preset]) => ({ id, label: preset.label, chars: preset.chars }))
