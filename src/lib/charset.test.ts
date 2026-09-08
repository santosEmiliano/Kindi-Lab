import { describe, expect, it } from 'vitest'
import { buildRing, CHARSET_PRESETS } from './charset'

const ENIE = 'Ñ' // "N-tilde"
const CJK_ZHONG = '中'
const CJK_WEN = '文'
const ASTRAL = '\u{20000}'
const E_ACUTE_PRECOMPOSED = 'é'
const E_ACUTE_DECOMPOSED = 'é' // "e" + U+0301 combining acute accent

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

  it('places the N-tilde after "Z" for the Spanish preset', () => {
    const ring = buildRing(CHARSET_PRESETS['spanish-upper'].chars)
    expect(ring.size).toBe(27)
    expect(ring.indexOf('Z')).toBe(25)
    expect(ring.indexOf(ENIE)).toBe(26)
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

  it('collapses a decomposed character to a single ring position', () => {
    const ring = buildRing(E_ACUTE_DECOMPOSED)
    expect(ring.size).toBe(1)
    expect(ring.chars).toEqual([E_ACUTE_PRECOMPOSED])
    expect(ring.indexOf(E_ACUTE_PRECOMPOSED)).toBe(0)
    expect(ring.indexOf(E_ACUTE_DECOMPOSED)).toBe(-1)
  })

  it('treats an astral character and a CJK block as one position each', () => {
    const ring = buildRing(ASTRAL + CJK_ZHONG + CJK_WEN)
    expect(ring.size).toBe(3)
    expect(ring.chars).toEqual([CJK_ZHONG, CJK_WEN, ASTRAL])
  })
})
