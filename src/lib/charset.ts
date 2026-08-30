export interface Ring {
  readonly chars: readonly string[]
  readonly size: number
  indexOf(char: string): number
  at(position: number): string
  has(char: string): boolean
}

export function buildRing(source: string): Ring {
  const unique = [...new Set(Array.from(source))].sort(
    (a, b) => (a.codePointAt(0) ?? 0) - (b.codePointAt(0) ?? 0),
  )

  if (unique.length === 0) {
    throw new Error('A charset ring needs at least one character.')
  }

  const positionByChar = new Map<string, number>()
  unique.forEach((char, index) => positionByChar.set(char, index))

  const size = unique.length

  return {
    chars: unique,
    size,
    indexOf: (char) => positionByChar.get(char) ?? -1,
    at: (position) => unique[((position % size) + size) % size],
    has: (char) => positionByChar.has(char),
  }
}

export const CHARSET_PRESETS = {
  'spanish-upper': {
    label: 'Español (A–Z, Ñ)',
    chars: 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ',
  },
  'spanish-mixed': {
    label: 'Español (may/min, Ñ)',
    chars: 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZabcdefghijklmnñopqrstuvwxyz',
  },
  'spanish-accents': {
    label: 'Español + acentos',
    chars: 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZÁÉÍÓÚÜ',
  },
  'ascii-printable': {
    label: 'ASCII imprimible',
    chars: asciiRange(0x20, 0x7e),
  },
} as const

export type CharsetPresetId = keyof typeof CHARSET_PRESETS

function asciiRange(from: number, to: number): string {
  let out = ''
  for (let code = from; code <= to; code++) out += String.fromCharCode(code)
  return out
}
