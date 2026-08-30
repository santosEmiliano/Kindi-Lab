import { describe, expect, it } from 'vitest'
import { buildRing, CHARSET_PRESETS } from './charset'

describe('buildRing', () => {
  it('sorts characters by code point', () => {
    const ring = buildRing('dbca')
    expect(ring.chars).toEqual(['a', 'b', 'c', 'd'])
  })

  it('deduplicates the source', () => {
    const ring = buildRing('aabbbc')
    expect(ring.chars).toEqual(['a', 'b', 'c'])
    expect(ring.size).toBe(3)
  })

  it('places "Ñ" after "Z" for the Spanish preset', () => {
    const ring = buildRing(CHARSET_PRESETS['spanish-upper'].chars)
    expect(ring.size).toBe(27)
    expect(ring.indexOf('Z')).toBe(25)
    expect(ring.indexOf('Ñ')).toBe(26)
  })

  it('reports -1 for characters outside the ring', () => {
    const ring = buildRing('ABC')
    expect(ring.indexOf(' ')).toBe(-1)
    expect(ring.has('D')).toBe(false)
  })

  it('wraps at() around the ring for any integer position', () => {
    const ring = buildRing('ABCD')
    expect(ring.at(0)).toBe('A')
    expect(ring.at(4)).toBe('A')
    expect(ring.at(-1)).toBe('D')
    expect(ring.at(9)).toBe('B')
  })

  it('throws on an empty ring', () => {
    expect(() => buildRing('')).toThrow()
  })
})
