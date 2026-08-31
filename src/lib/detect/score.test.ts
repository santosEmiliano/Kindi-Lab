import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildRing, CHARSET_PRESETS } from '../charset'
import { caesarEncrypt } from '../ciphers'
import { decodeQuadgrams, parseWordList, type QuadgramMeta } from '../spanish-data'
import { scoreQuadgrams, scoreWordRatio } from './score'

const asset = (name: string) =>
  readFileSync(resolve(process.cwd(), 'src/assets', name))

const model = decodeQuadgrams(
  new Uint8Array(asset('quadgrams-es.bin')).buffer,
  JSON.parse(asset('quadgrams-es.meta.json').toString('utf8')) as QuadgramMeta,
)
const words = parseWordList(asset('words-es.txt').toString('utf8'))
const ring = buildRing(CHARSET_PRESETS['spanish-mixed'].chars)

describe('scoreQuadgrams', () => {
  it('scores fluent Spanish above scrambled text of the same length', () => {
    expect(
      scoreQuadgrams('tengo mucha hambre', model),
    ).toBeGreaterThan(
      scoreQuadgrams('qxxjrx nucmx bngjs', model),
    )
  })

  it('peaks at the true plaintext across every Caesar shift', () => {
    const plain = 'tengo mucha hambre'
    const scores = Array.from({ length: ring.size }, (_, shift) =>
      scoreQuadgrams(caesarEncrypt(plain, ring, shift), model),
    )
    expect(scores.indexOf(Math.max(...scores))).toBe(0)
  })

  it('returns the floor for text shorter than one quadgram', () => {
    expect(scoreQuadgrams('el', model)).toBe(model.floorLog10)
  })
})

describe('scoreWordRatio', () => {
  it('is 1 when every token is a Spanish word', () => {
    expect(scoreWordRatio('hola mundo esto es una prueba', words)).toBe(1)
  })

  it('is 0 when no token is a word', () => {
    expect(scoreWordRatio('xqz wkjv bpfh', words)).toBe(0)
  })

  it('folds accents and ignores punctuation-only tokens', () => {
    expect(scoreWordRatio('¡canción — feliz!', words)).toBe(1)
  })

  it('returns 0 for blank input', () => {
    expect(scoreWordRatio('   ', words)).toBe(0)
  })
})
