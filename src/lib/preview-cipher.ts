import type { Method } from '../types'

const SPANISH_RING = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('')
const SN = SPANISH_RING.length

const ES: Record<string, number> = {
  A: 0.1153, B: 0.0148, C: 0.0368, D: 0.047, E: 0.1368, F: 0.0069, G: 0.01,
  H: 0.007, I: 0.0625, J: 0.0044, K: 0.0002, L: 0.0497, M: 0.0315, N: 0.0671,
  Ñ: 0.0031, O: 0.0868, P: 0.0251, Q: 0.0088, R: 0.0687, S: 0.0798, T: 0.0463,
  U: 0.0393, V: 0.009, W: 0.0002, X: 0.0022, Y: 0.009, Z: 0.0052,
}

export const ringLabels: readonly string[] = [...SPANISH_RING]
export const expectedSpanish: readonly number[] = SPANISH_RING.map((l) => ES[l])

function indexOf(ring: readonly string[]): Map<string, number> {
  return new Map(ring.map((ch, i) => [ch, i]))
}

function mapChar(
  ch: string,
  ring: readonly string[],
  index: Map<string, number>,
  target: (pos: number, n: number) => number,
): string {
  const direct = index.get(ch)
  if (direct !== undefined) return ring[target(direct, ring.length)]
  const upper = ch.toUpperCase()
  if (upper !== ch) {
    const folded = index.get(upper)
    if (folded !== undefined) return ring[target(folded, ring.length)].toLowerCase()
  }
  return ch
}

export function caesar(text: string, k: number, ring: readonly string[]): string {
  const n = ring.length
  if (n < 1) return text
  const delta = ((k % n) + n) % n
  const index = indexOf(ring)
  let out = ''
  for (const ch of text) {
    out += mapChar(ch, ring, index, (pos, size) => (pos + delta) % size)
  }
  return out
}

export function atbash(text: string, ring: readonly string[]): string {
  const n = ring.length
  if (n < 1) return text
  const index = indexOf(ring)
  let out = ''
  for (const ch of text) {
    out += mapChar(ch, ring, index, (pos, size) => size - 1 - pos)
  }
  return out
}

export function letterFrequencies(text: string): number[] {
  const counts = new Array<number>(SN).fill(0)
  let total = 0
  for (const ch of text.toUpperCase()) {
    const pos = SPANISH_RING.indexOf(ch)
    if (pos >= 0) {
      counts[pos]++
      total++
    }
  }
  return counts.map((count) => (total ? count / total : 0))
}

function chiSquare(freqs: number[]): number {
  let sum = 0
  for (let i = 0; i < SN; i++) {
    const expected = expectedSpanish[i]
    sum += (freqs[i] - expected) ** 2 / expected
  }
  return sum
}

export interface PreviewDetection {
  plaintext: string
  method: Method
  shift: number | null
  confidence: number
}

export function detect(
  ciphertext: string,
  ring: readonly string[],
): PreviewDetection {
  const n = ring.length
  const candidates: { method: Method; shift: number | null; text: string }[] = [
    { method: 'atbash', shift: null, text: atbash(ciphertext, ring) },
  ]
  for (let k = 1; k < n; k++) {
    candidates.push({ method: 'caesar', shift: k, text: caesar(ciphertext, -k, ring) })
  }

  const scored = candidates
    .map((candidate) => ({
      ...candidate,
      score: chiSquare(letterFrequencies(candidate.text)),
    }))
    .sort((a, b) => a.score - b.score)

  const [best, runnerUp] = scored
  const gap = runnerUp ? (runnerUp.score - best.score) / best.score : 1

  return {
    plaintext: best.text,
    method: best.method,
    shift: best.shift,
    confidence: Math.max(0, Math.min(1, gap)),
  }
}
