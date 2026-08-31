import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildRing, CHARSET_PRESETS } from '../charset'
import { atbash, caesarEncrypt } from '../ciphers'
import { decodeQuadgrams, parseWordList, type QuadgramMeta } from '../spanish-data'
import { detectCipher } from './select'

const asset = (name: string) =>
  readFileSync(resolve(process.cwd(), 'src/assets', name))

const data = {
  quadgrams: decodeQuadgrams(
    new Uint8Array(asset('quadgrams-es.bin')).buffer,
    JSON.parse(asset('quadgrams-es.meta.json').toString('utf8')) as QuadgramMeta,
  ),
  words: parseWordList(asset('words-es.txt').toString('utf8')),
}

const mixed = buildRing(CHARSET_PRESETS['spanish-mixed'].chars)
const upper = buildRing(CHARSET_PRESETS['spanish-upper'].chars)
const ascii = buildRing(CHARSET_PRESETS['ascii-printable'].chars)

describe('detectCipher', () => {
  it('recovers a Caesar-encrypted sentence with high confidence', () => {
    const plain = 'el enemigo cruza el rio al amanecer sin hacer ruido'
    const result = detectCipher(caesarEncrypt(plain, mixed, 11), mixed, data)
    expect(result.method).toBe('caesar')
    expect(result.shift).toBe(11)
    expect(result.plaintext).toBe(plain)
    expect(result.confidence).toBeGreaterThan(0.9)
  })

  it('recovers an Atbash-encrypted sentence', () => {
    const plain = 'nos vemos manana en la plaza a las seis de la tarde'
    const result = detectCipher(atbash(plain, mixed), mixed, data)
    expect(result.method).toBe('atbash')
    expect(result.shift).toBeNull()
    expect(result.plaintext).toBe(plain)
    expect(result.confidence).toBeGreaterThan(0.7)
  })

  it('works over an all-caps ring', () => {
    const plain = 'ATAQUE AL AMANECER POR EL FLANCO ESTE'
    const result = detectCipher(caesarEncrypt(plain, upper, 9), upper, data)
    expect(result).toMatchObject({ method: 'caesar', shift: 9, plaintext: plain })
    expect(result.confidence).toBeGreaterThan(0.9)
  })

  it('works over the printable-ASCII ring where shifts change folded length', () => {
    const plain = 'la reunion sera en el sotano a medianoche sin excepcion'
    const result = detectCipher(caesarEncrypt(plain, ascii, 40), ascii, data)
    expect(result).toMatchObject({ method: 'caesar', shift: 40, plaintext: plain })
    expect(result.confidence).toBeGreaterThan(0.7)
  })

  it('reports near-zero confidence on text too short to judge', () => {
    const result = detectCipher(caesarEncrypt('si', mixed, 4), mixed, data)
    expect(result.confidence).toBeLessThan(0.3)
  })

  it('returns a finite, empty result for empty input', () => {
    const result = detectCipher('', mixed, data)
    expect(result.plaintext).toBe('')
    expect(result.confidence).toBe(0)
    expect(Number.isFinite(result.quadgramScore)).toBe(true)
  })

  it('exposes the raw signals of the winning candidate', () => {
    const plain = 'tengo mucha hambre y quiero comer algo caliente ahora'
    const result = detectCipher(atbash(plain, mixed), mixed, data)
    expect(result.wordRatio).toBe(1)
    expect(result.quadgramScore).toBeLessThan(0)
  })
})
