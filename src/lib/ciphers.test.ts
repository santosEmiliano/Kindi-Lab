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
