import type { Ring } from './charset'

export function caesarEncrypt(text: string, ring: Ring, shift: number): string {
  return mapRingChars(text, ring, (index) => ring.at(index + shift))
}

export function caesarDecrypt(text: string, ring: Ring, shift: number): string {
  return caesarEncrypt(text, ring, -shift)
}

export function atbash(text: string, ring: Ring): string {
  return mapRingChars(text, ring, (index) => ring.at(ring.size - 1 - index))
}

function mapRingChars(
  text: string,
  ring: Ring,
  transform: (index: number) => string,
): string {
  let out = ''
  for (const char of text) {
    const index = ring.indexOf(char)
    out += index < 0 ? char : transform(index)
  }
  return out
}
