import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildRing, CHARSET_PRESETS, type CharsetPresetId } from '../charset'
import { atbash, caesarEncrypt } from '../ciphers'
import { decodeQuadgrams, parseWordList, type QuadgramMeta } from '../spanish-data'
import { RECOVERY_CASES } from './recovery-cases'
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

const rings = new Map<CharsetPresetId, ReturnType<typeof buildRing>>(
  (Object.keys(CHARSET_PRESETS) as CharsetPresetId[]).map((id) => [
    id,
    buildRing(CHARSET_PRESETS[id].chars),
  ]),
)

describe('recovery suite', () => {
  it('recovers method, shift and plaintext for every case', () => {
    const failures: string[] = []

    for (const testCase of RECOVERY_CASES) {
      const ring = rings.get(testCase.preset)!
      const ciphertext =
        testCase.method === 'atbash'
          ? atbash(testCase.plain, ring)
          : caesarEncrypt(testCase.plain, ring, testCase.shift)

      const result = detectCipher(ciphertext, ring, data)
      const expectedShift = testCase.method === 'atbash' ? null : testCase.shift

      if (
        result.method !== testCase.method ||
        result.shift !== expectedShift ||
        result.plaintext !== testCase.plain
      ) {
        failures.push(
          `[${testCase.preset}/${testCase.method}] -> ${result.method}/${result.shift} ` +
            `"${result.plaintext.slice(0, 48)}" (expected "${testCase.plain.slice(0, 48)}")`,
        )
      }
    }

    expect(failures).toEqual([])
  })

  it('spans at least 50 cases across both methods and every charset preset', () => {
    expect(RECOVERY_CASES.length).toBeGreaterThanOrEqual(50)
    expect(new Set(RECOVERY_CASES.map((c) => c.method))).toEqual(
      new Set(['caesar', 'atbash']),
    )
    expect(new Set(RECOVERY_CASES.map((c) => c.preset)).size).toBe(
      Object.keys(CHARSET_PRESETS).length,
    )
  })
})
