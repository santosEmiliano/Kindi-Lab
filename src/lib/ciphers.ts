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
  // Match the NFC normalization applied when the ring is built, so decomposed
  // input still lines up with ring positions.
  for (const char of text.normalize('NFC')) {
    const index = ring.indexOf(char)
    out += index < 0 ? char : transform(index)
  }
  return out
}
