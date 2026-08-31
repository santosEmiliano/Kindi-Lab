import { foldToLatin } from './detect/normalize'

const CODE_A = 65

export const HISTOGRAM_LABELS: readonly string[] = Array.from(
  { length: 26 },
  (_, index) => String.fromCharCode(CODE_A + index),
)

export function letterHistogram(text: string): number[] {
  const counts = new Array<number>(26).fill(0)
  let total = 0
  for (const char of foldToLatin(text)) {
    counts[char.charCodeAt(0) - 97]++
    total++
  }
  return total === 0 ? counts : counts.map((count) => count / total)
}

export function expectedFrequencies(
  byLetter: Readonly<Record<string, number>>,
): number[] {
  return HISTOGRAM_LABELS.map((label) => byLetter[label.toLowerCase()] ?? 0)
}
