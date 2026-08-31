import { describe, expect, it } from 'vitest'
import { atbash, caesar, detect, letterFrequencies } from './preview-cipher'

describe('preview-cipher', () => {
  it('shifts along the 27-letter Spanish ring, wrapping through Ñ', () => {
    expect(caesar('ABC', 3)).toBe('DEF')
    expect(caesar('MNO', 1)).toBe('NÑP')
    expect(caesar('XYZ', 3)).toBe('ABC')
  })

  it('round-trips Caesar with the inverse shift', () => {
    const plain = 'El saber es la única riqueza.'
    expect(caesar(caesar(plain, 7), -7)).toBe(plain)
  })

  it('is involutive for Atbash', () => {
    const plain = 'La escritura secreta.'
    expect(atbash(atbash(plain))).toBe(plain)
    expect(atbash('A')).toBe('Z')
    expect(atbash('abc')).toBe('zyx')
  })

  it('preserves case and leaves off-ring characters untouched', () => {
    expect(caesar('Hola, mundo!', 1)).toBe('Ipmb, nvñep!')
  })

  it('recovers a Caesar phrase and its shift', () => {
    const plain = 'La escritura secreta se rompe contando letras, no adivinando.'
    const result = detect(caesar(plain, 7))
    expect(result.method).toBe('caesar')
    expect(result.shift).toBe(7)
    expect(result.plaintext).toBe(plain)
  })

  it('recovers an Atbash phrase', () => {
    const plain = 'El saber es la unica riqueza que un tirano no puede confiscar.'
    const result = detect(atbash(plain))
    expect(result.method).toBe('atbash')
    expect(result.shift).toBeNull()
    expect(result.plaintext).toBe(plain)
  })

  it('produces a distribution that sums to one over the ring', () => {
    const freqs = letterFrequencies('AAAA BBB CC')
    expect(freqs).toHaveLength(27)
    expect(freqs.reduce((a, b) => a + b, 0)).toBeCloseTo(1)
    expect(freqs[0]).toBeCloseTo(4 / 9)
  })
})
