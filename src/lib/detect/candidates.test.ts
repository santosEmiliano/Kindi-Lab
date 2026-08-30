import { describe, expect, it } from 'vitest'
import { buildRing, CHARSET_PRESETS } from '../charset'
import { atbash, caesarEncrypt } from '../ciphers'
import { generateCandidates } from './candidates'

const ring = buildRing(CHARSET_PRESETS['spanish-upper'].chars)

describe('generateCandidates', () => {
  it('produces one Atbash candidate plus one per non-zero Caesar shift', () => {
    const candidates = generateCandidates('HOLA', ring)
    expect(candidates).toHaveLength(ring.size)
    expect(candidates.filter((c) => c.method === 'atbash')).toHaveLength(1)
    expect(candidates.filter((c) => c.method === 'caesar')).toHaveLength(
      ring.size - 1,
    )
  })

  it('covers every Caesar shift from 1 to size - 1', () => {
    const shifts = generateCandidates('X', ring)
      .filter((c) => c.method === 'caesar')
      .map((c) => c.shift)
    expect(shifts).toEqual(
      Array.from({ length: ring.size - 1 }, (_, i) => i + 1),
    )
  })

  it('recovers the plaintext of a Caesar-encrypted message', () => {
    const plain = 'TENGOMUCHAHAMBRE'
    const candidate = generateCandidates(
      caesarEncrypt(plain, ring, 7),
      ring,
    ).find((c) => c.text === plain)
    expect(candidate).toEqual({ method: 'caesar', shift: 7, text: plain })
  })

  it('recovers the plaintext of an Atbash-encrypted message', () => {
    const plain = 'TENGOMUCHAHAMBRE'
    const candidate = generateCandidates(atbash(plain, ring), ring).find(
      (c) => c.text === plain,
    )
    expect(candidate?.method).toBe('atbash')
    expect(candidate?.shift).toBeNull()
  })
})
