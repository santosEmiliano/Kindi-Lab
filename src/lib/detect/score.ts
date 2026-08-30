import type { QuadgramModel } from '../spanish-data'
import { foldToLatin } from './normalize'

export function scoreQuadgrams(text: string, model: QuadgramModel): number {
  const folded = foldToLatin(text)
  if (folded.length < model.order) return model.floorLog10

  let total = 0
  for (let i = 0; i + model.order <= folded.length; i++) {
    total += model.logProb(folded.slice(i, i + model.order))
  }
  return total
}

export function scoreWordRatio(
  text: string,
  words: ReadonlySet<string>,
): number {
  let total = 0
  let valid = 0
  for (const token of text.split(/\s+/)) {
    const folded = foldToLatin(token)
    if (!folded) continue
    total++
    if (words.has(folded)) valid++
  }
  return total === 0 ? 0 : valid / total
}
