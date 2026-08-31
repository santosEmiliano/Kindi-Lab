const RING = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('')
const N = RING.length

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
