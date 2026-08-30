export interface QuadgramMeta {
  alphabet: string
  order: number
  tableSize: number
  floorLog10: number
}

export interface QuadgramModel {
  readonly order: number
  readonly alphabet: string
  readonly floorLog10: number
  readonly logProbs: Float32Array
  logProb(quadgram: string): number
}

export interface SpanishData {
  quadgrams: QuadgramModel
  words: ReadonlySet<string>
  letterFrequencies: Readonly<Record<string, number>>
}

const QUADGRAMS_BIN = new URL('../assets/quadgrams-es.bin', import.meta.url)
const QUADGRAMS_META = new URL('../assets/quadgrams-es.meta.json', import.meta.url)
const WORDS = new URL('../assets/words-es.txt', import.meta.url)
const LETTER_FREQ = new URL('../assets/letter-freq-es.json', import.meta.url)

export function decodeQuadgrams(
  buffer: ArrayBuffer,
  meta: QuadgramMeta,
): QuadgramModel {
  const logProbs = new Float32Array(buffer)
  if (logProbs.length !== meta.tableSize) {
    throw new Error(
      `quadgram table has ${logProbs.length} entries, expected ${meta.tableSize}`,
    )
  }

  const base = meta.alphabet.length
  const floorLog10 = Math.fround(meta.floorLog10)
  const rank = new Map(
    Array.from(meta.alphabet, (char, index): [string, number] => [char, index]),
  )

  return {
    order: meta.order,
    alphabet: meta.alphabet,
    floorLog10,
    logProbs,
    logProb(quadgram) {
      if (quadgram.length !== meta.order) return floorLog10
      let index = 0
      for (const char of quadgram) {
        const value = rank.get(char)
        if (value === undefined) return floorLog10
        index = index * base + value
      }
      return logProbs[index]
    },
  }
}

export function parseWordList(text: string): Set<string> {
  const words = new Set<string>()
  for (const line of text.split('\n')) {
    const word = line.trim()
    if (word) words.add(word)
  }
  return words
}

let cache: Promise<SpanishData> | undefined

export function loadSpanishData(): Promise<SpanishData> {
  if (!cache) cache = fetchSpanishData()
  return cache
}

async function fetchSpanishData(): Promise<SpanishData> {
  const responses = await Promise.all([
    fetch(QUADGRAMS_BIN),
    fetch(QUADGRAMS_META),
    fetch(WORDS),
    fetch(LETTER_FREQ),
  ])
  for (const response of responses) {
    if (!response.ok) {
      throw new Error(
        `failed to load Spanish data: ${response.url} ${response.status}`,
      )
    }
  }

  const [binResponse, metaResponse, wordsResponse, freqResponse] = responses
  const [buffer, meta, wordsText, freqFile] = await Promise.all([
    binResponse.arrayBuffer(),
    metaResponse.json() as Promise<QuadgramMeta>,
    wordsResponse.text(),
    freqResponse.json() as Promise<{ frequencies: Record<string, number> }>,
  ])

  return {
    quadgrams: decodeQuadgrams(buffer, meta),
    words: parseWordList(wordsText),
    letterFrequencies: freqFile.frequencies,
  }
}
