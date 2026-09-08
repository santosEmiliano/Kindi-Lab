import { describe, expect, it } from 'vitest'
import { buildRing, CHARSET_PRESETS } from './charset'
import { atbash, caesarDecrypt, caesarEncrypt } from './ciphers'

const abcde = buildRing('ABCDE')
const presetRings = Object.values(CHARSET_PRESETS).map((preset) =>
  buildRing(preset.chars),
)
const sample = 'Esto obviamente no es una prueba para saber si mi código funciona o no'

describe('caesarEncrypt', () => {
  it('shifts characters forward along the ring', () => {
    expect(caesarEncrypt('CAB', abcde, 2)).toBe('ECD')
  })

  it('wraps around the end of the ring', () => {
    expect(caesarEncrypt('E', abcde, 2)).toBe('B')
  })

  it('accepts a negative shift', () => {
    expect(caesarEncrypt('C', abcde, -2)).toBe('A')
  })

  it('leaves characters outside the ring untouched', () => {
    expect(caesarEncrypt('CAB! CAB', abcde, 2)).toBe('ECD! ECD')
  })

  it('is the identity for a shift of 0 or the ring size', () => {
    expect(caesarEncrypt(sample, presetRings[0], 0)).toBe(sample)
    expect(caesarEncrypt(sample, abcde, abcde.size)).toBe(sample)
  })
})

describe('caesarDecrypt', () => {
  it('reverses caesarEncrypt for every shift on every preset ring', () => {
    for (const ring of presetRings) {
      for (let shift = 0; shift < ring.size; shift++) {
        expect(caesarDecrypt(caesarEncrypt(sample, ring, shift), ring, shift)).toBe(
          sample,
        )
      }
    }
  })
})

describe('atbash', () => {
  it('reflects characters across the ring', () => {
    expect(atbash('A', abcde)).toBe('E')
    expect(atbash('CAB', abcde)).toBe('CED')
  })

  it('leaves characters outside the ring untouched', () => {
    expect(atbash('CAB! CAB', abcde)).toBe('CED! CED')
  })

  it('is involutive on every preset ring', () => {
    for (const ring of presetRings) {
      expect(atbash(atbash(sample, ring), ring)).toBe(sample)
    }
  })
})

describe('full ring beyond the visual card cap', () => {
  const wide = buildRing(CHARSET_PRESETS['ascii-printable'].chars)

  it('ciphers characters positioned past the 50th slot', () => {
    expect(wide.size).toBeGreaterThan(50)
    const far = wide.chars[80]
    expect(caesarDecrypt(caesarEncrypt(far, wide, 47), wide, 47)).toBe(far)
    expect(atbash(atbash(far, wide), wide)).toBe(far)
  })
})

describe('NFC normalization', () => {
  const CJK = '中文日本語' // 中文日本語
  const ASTRAL = '\u{20000}\u{20001}\u{20002}'
  const E_ACUTE_DECOMPOSED = 'é'
  const E_ACUTE_PRECOMPOSED = 'é'
  const mixedRing = buildRing('ABCDE' + CJK + ASTRAL)

  it('maps decomposed input onto the same position as its precomposed form', () => {
    const ring = buildRing('AB' + E_ACUTE_PRECOMPOSED)
    expect(caesarEncrypt('A' + E_ACUTE_DECOMPOSED, ring, 1)).toBe(
      'B' + caesarEncrypt(E_ACUTE_PRECOMPOSED, ring, 1),
    )
  })

  it('round-trips a Caesar shift over a mixed ASCII + CJK + astral ring', () => {
    const plain = 'A' + CJK + 'E' + ASTRAL
    for (let shift = 0; shift < mixedRing.size; shift++) {
      expect(
        caesarDecrypt(caesarEncrypt(plain, mixedRing, shift), mixedRing, shift),
      ).toBe(plain)
    }
  })

  it('round-trips Atbash over a mixed ASCII + CJK + astral ring', () => {
    const plain = 'B' + ASTRAL + CJK + 'D'
    expect(atbash(atbash(plain, mixedRing), mixedRing)).toBe(plain)
  })

  it('yields the NFC form when the input is decomposed', () => {
    const ring = buildRing('XY' + E_ACUTE_PRECOMPOSED)
    const decrypted = caesarDecrypt(
      caesarEncrypt('X' + E_ACUTE_DECOMPOSED, ring, 2),
      ring,
      2,
    )
    expect(decrypted).toBe('X' + E_ACUTE_PRECOMPOSED)
    expect(decrypted).not.toBe('X' + E_ACUTE_DECOMPOSED)
  })
})
