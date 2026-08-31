import type { Method } from '../types'

const RING = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('')
const N = RING.length

const ES: Record<string, number> = {
  A: 0.1153, B: 0.0148, C: 0.0368, D: 0.047, E: 0.1368, F: 0.0069, G: 0.01,
  H: 0.007, I: 0.0625, J: 0.0044, K: 0.0002, L: 0.0497, M: 0.0315, N: 0.0671,
  Ñ: 0.0031, O: 0.0868, P: 0.0251, Q: 0.0088, R: 0.0687, S: 0.0798, T: 0.0463,
  U: 0.0393, V: 0.009, W: 0.0002, X: 0.0022, Y: 0.009, Z: 0.0052,
}

export const ringLabels: readonly string[] = [...RING]
export const expectedSpanish: readonly number[] = RING.map((letter) => ES[letter])

function isLower(ch: string): boolean {
  return ch !== ch.toUpperCase() && ch === ch.toLowerCase()
}

function keepCase(source: string, out: string): string {
  return isLower(source) ? out.toLowerCase() : out
}

function shiftChar(ch: string, delta: number): string {
  const pos = RING.indexOf(ch.toUpperCase())
  if (pos < 0) return ch
  return keepCase(ch, RING[(pos + delta) % N])
}

export function caesar(text: string, k: number): string {
  const delta = ((k % N) + N) % N
  let out = ''
  for (const ch of text) out += shiftChar(ch, delta)
  return out
}

export function atbash(text: string): string {
  let out = ''
  for (const ch of text) {
    const pos = RING.indexOf(ch.toUpperCase())
    out += pos < 0 ? ch : keepCase(ch, RING[N - 1 - pos])
  }
  return out
}

export function letterFrequencies(text: string): number[] {
  const counts = new Array<number>(N).fill(0)
  let total = 0
  for (const ch of text.toUpperCase()) {
    const pos = RING.indexOf(ch)
    if (pos >= 0) {
      counts[pos]++
      total++
    }
  }
  return counts.map((count) => (total ? count / total : 0))
}

function chiSquare(freqs: number[]): number {
  let sum = 0
  for (let i = 0; i < N; i++) {
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

export function detect(ciphertext: string): PreviewDetection {
  const candidates: { method: Method; shift: number | null; text: string }[] = [
    { method: 'atbash', shift: null, text: atbash(ciphertext) },
  ]
  for (let k = 1; k < N; k++) {
    candidates.push({ method: 'caesar', shift: k, text: caesar(ciphertext, -k) })
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
