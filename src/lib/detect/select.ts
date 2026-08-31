import type { Ring } from '../charset'
import type { SpanishData } from '../spanish-data'
import { type CipherMethod, generateCandidates } from './candidates'
import { foldToLatin } from './normalize'
import { scoreQuadgrams, scoreWordRatio } from './score'

const SEPARATION_SCALE = 3
const MIN_FOLD_RATIO = 0.6
const TIE_EPSILON = 0.05

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
    if (foldToLatin(token).length >= 2) count++
  }
  return count
}

function lowercaseFraction(text: string): number {
  const letters = text.match(/\p{L}/gu)?.length ?? 0
  if (letters === 0) return 0
  return (text.match(/\p{Ll}/gu)?.length ?? 0) / letters
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
      lowercase: lowercaseFraction(candidate.text),
    }
  })

  const maxFold = Math.max(...scored.map((entry) => entry.folded.length))
  const eligible = scored.filter(
    (entry) => entry.folded.length >= MIN_FOLD_RATIO * maxFold,
  )

  eligible.sort((a, b) => b.averageQuadgram - a.averageQuadgram)

  const topAverage = eligible[0].averageQuadgram
  const contenders = eligible.filter(
    (entry) => entry.averageQuadgram >= topAverage - TIE_EPSILON,
  )
  contenders.sort(
    (a, b) =>
      b.wordRatio - a.wordRatio ||
      b.lowercase - a.lowercase ||
      b.averageQuadgram - a.averageQuadgram,
  )

  const best = contenders[0]
  const rival = eligible.find((entry) => entry.folded !== best.folded)
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
