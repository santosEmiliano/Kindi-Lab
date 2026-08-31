export interface CharsetPreset {
  id: string
  label: string
  chars: string
}

function asciiRange(from: number, to: number): string {
  let out = ''
  for (let code = from; code <= to; code++) out += String.fromCharCode(code)
  return out
}

export const CHARSET_PRESETS: readonly CharsetPreset[] = [
  {
    id: 'spanish-upper',
    label: 'Español (A–Z, Ñ)',
    chars: 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ',
  },
  {
    id: 'spanish-mixed',
    label: 'Español (may/min, Ñ)',
    chars: 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZabcdefghijklmnñopqrstuvwxyz',
  },
  {
    id: 'spanish-accents',
    label: 'Español + acentos',
    chars: 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZÁÉÍÓÚÜ',
  },
  {
    id: 'ascii-printable',
    label: 'ASCII imprimible',
    chars: asciiRange(0x20, 0x7e),
  },
]

export const CUSTOM_CHARSET_ID = 'custom'
export const MIN_RING_SIZE = 2

export function buildPreviewRing(source: string): string[] {
  return [...new Set(Array.from(source))].sort(
    (a, b) => (a.codePointAt(0) ?? 0) - (b.codePointAt(0) ?? 0),
  )
}
