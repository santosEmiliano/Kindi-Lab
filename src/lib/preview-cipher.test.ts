import { describe, expect, it } from 'vitest'
import { atbash, caesar, detect, letterFrequencies } from './preview-cipher'

const ring = (source: string): string[] =>
  [...new Set(Array.from(source))].sort(
    (a, b) => (a.codePointAt(0) ?? 0) - (b.codePointAt(0) ?? 0),
  )

const ES = ring('ABCDEFGHIJKLMNÑOPQRSTUVWXYZ')
const ASCII = ring(
  Array.from({ length: 0x7e - 0x20 + 1 }, (_, i) => String.fromCharCode(0x20 + i)).join(''),
)

describe('preview-cipher', () => {
  it('shifts along the code-point-sorted ring (Ñ sits after Z)', () => {
    expect(caesar('ABC', 3, ES)).toBe('DEF')
    expect(caesar('WXY', 1, ES)).toBe('XYZ')
    expect(caesar('YZÑ', 1, ES)).toBe('ZÑA')
  })

  it('round-trips Caesar with the inverse shift', () => {
    const plain = 'El saber es la única riqueza.'
    expect(caesar(caesar(plain, 7, ES), -7, ES)).toBe(plain)
  })

  it('is involutive for Atbash', () => {
    const plain = 'La escritura secreta.'
    expect(atbash(atbash(plain, ES), ES)).toBe(plain)
    expect(atbash('A', ES)).toBe('Ñ')
    expect(atbash('N', ES)).toBe('N')
  })

  it('folds lowercase onto an uppercase ring and passes off-ring characters', () => {
    expect(caesar('Hola, mundo!', 1, ES)).toBe('Ipmb, nvoep!')
  })

  it('treats case as distinct when the ring is case-sensitive', () => {
    expect(caesar('aA', 1, ASCII)).toBe('bB')
  })

  it('recovers a Caesar phrase and its shift', () => {
    const plain = 'La escritura secreta se rompe contando letras, no adivinando.'
    const result = detect(caesar(plain, 7, ES), ES)
    expect(result.method).toBe('caesar')
    expect(result.shift).toBe(7)
    expect(result.plaintext).toBe(plain)
  })

  it('recovers an Atbash phrase', () => {
    const plain = 'El saber es la unica riqueza que un tirano no puede confiscar.'
    const result = detect(atbash(plain, ES), ES)
    expect(result.method).toBe('atbash')
    expect(result.shift).toBeNull()
    expect(result.plaintext).toBe(plain)
  })

  it('produces a Spanish distribution that sums to one', () => {
    const freqs = letterFrequencies('AAAA BBB CC')
    expect(freqs).toHaveLength(27)
    expect(freqs.reduce((a, b) => a + b, 0)).toBeCloseTo(1)
    expect(freqs[0]).toBeCloseTo(4 / 9)
  })
})
