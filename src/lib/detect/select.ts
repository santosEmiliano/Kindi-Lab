import type { Ring } from '../charset'
import type { SpanishData } from '../spanish-data'
import { type CipherMethod, generateCandidates } from './candidates'
import { foldToLatin } from './normalize'
import { scoreQuadgrams, scoreWordRatio } from './score'

const SEPARATION_SCALE = 3

export interface DetectionResult {
  plaintext: string
  method: CipherMethod
  shift: number | null
  confidence: number
  quadgramScore: number
  wordRatio: number
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

function countWordTokens(text: string): number {
  let count = 0
  for (const token of text.split(/\s+/)) {
    if (foldToLatin(token)) count++
  }
  return count
}

export function detectCipher(
  ciphertext: string,
  ring: Ring,
  data: Pick<SpanishData, 'quadgrams' | 'words'>,
): DetectionResult {
  const { quadgrams, words } = data

  const scored = generateCandidates(ciphertext, ring).map((candidate) => {
    const folded = foldToLatin(candidate.text)
    const quadgramScore = scoreQuadgrams(candidate.text, quadgrams)
    const quadgramCount = Math.max(1, folded.length - quadgrams.order + 1)
    return {
      candidate,
      folded,
      quadgramScore,
      averageQuadgram: quadgramScore / quadgramCount,
      wordRatio: scoreWordRatio(candidate.text, words),
    }
  })

  scored.sort((a, b) =>
    b.averageQuadgram !== a.averageQuadgram
      ? b.averageQuadgram - a.averageQuadgram
      : b.wordRatio - a.wordRatio,
  )

  const best = scored[0]
  const rival = scored.find((entry) => entry.folded !== best.folded)
  const separation = rival
    ? clamp01((best.averageQuadgram - rival.averageQuadgram) / SEPARATION_SCALE)
    : 0
  const blended =
    countWordTokens(best.candidate.text) >= 2
      ? 0.45 * separation + 0.55 * best.wordRatio
      : separation
  const confidence = Math.round(blended * 100) / 100

  return {
    plaintext: best.candidate.text,
    method: best.candidate.method,
    shift: best.candidate.shift,
    confidence,
    quadgramScore: best.quadgramScore,
    wordRatio: best.wordRatio,
  }
}
