import { describe, expect, it } from 'vitest'
import { atbash, caesar } from './preview-cipher'

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
})
