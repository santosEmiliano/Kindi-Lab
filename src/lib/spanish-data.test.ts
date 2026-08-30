import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { decodeQuadgrams, parseWordList, type QuadgramMeta } from './spanish-data'

const readAsset = (name: string) =>
  readFileSync(resolve(process.cwd(), 'src/assets', name))

const quadgramMeta = JSON.parse(
  readAsset('quadgrams-es.meta.json').toString('utf8'),
) as QuadgramMeta
const quadgramBuffer = new Uint8Array(readAsset('quadgrams-es.bin')).buffer
const wordsText = readAsset('words-es.txt').toString('utf8')
const wordsMeta = JSON.parse(
  readAsset('words-es.meta.json').toString('utf8'),
) as { count: number }

const sumLogProb = (model: ReturnType<typeof decodeQuadgrams>, text: string) => {
  let total = 0
  for (let i = 0; i + model.order <= text.length; i++) {
    total += model.logProb(text.slice(i, i + model.order))
  }
  return total
}

describe('decodeQuadgrams', () => {
  const model = decodeQuadgrams(quadgramBuffer, quadgramMeta)

  it('exposes one entry per possible quadgram', () => {
    expect(model.logProbs.length).toBe(26 ** 4)
    expect(model.order).toBe(4)
    expect(model.alphabet).toBe('abcdefghijklmnopqrstuvwxyz')
  })

  it('ranks common Spanish quadgrams well above the floor', () => {
    for (const quadgram of ['cion', 'ente', 'ando', 'para']) {
      expect(model.logProb(quadgram)).toBeGreaterThan(model.floorLog10 + 3)
    }
  })

  it('returns the floor for unseen, short, or out-of-alphabet quadgrams', () => {
    expect(model.logProb('qxzk')).toBe(model.floorLog10)
    expect(model.logProb('ab')).toBe(model.floorLog10)
    expect(model.logProb('ñoño')).toBe(model.floorLog10)
  })

  it('scores real Spanish above a Caesar-shifted copy of the same text', () => {
    expect(sumLogProb(model, 'estemensajeessecreto')).toBeGreaterThan(
      sumLogProb(model, 'hvwhphqvdmhhvvhfuhwr'),
    )
  })

  it('rejects a table whose length disagrees with the meta', () => {
    expect(() => decodeQuadgrams(new ArrayBuffer(8), quadgramMeta)).toThrow()
  })
})

describe('parseWordList', () => {
  const words = parseWordList(wordsText)

  it('loads every listed word and nothing empty', () => {
    expect(words.size).toBe(wordsMeta.count)
    expect(words.has('')).toBe(false)
  })

  it('contains common folded words and excludes noise', () => {
    for (const word of ['hola', 'mensaje', 'secreto', 'cancion', 'nino']) {
      expect(words.has(word)).toBe(true)
    }
    expect(words.has('xqzkw')).toBe(false)
  })
})
