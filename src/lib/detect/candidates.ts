import type { Ring } from '../charset'
import { atbash, caesarDecrypt } from '../ciphers'

export type CipherMethod = 'caesar' | 'atbash'

export interface Candidate {
  method: CipherMethod
  shift: number | null
  text: string
}

export function generateCandidates(ciphertext: string, ring: Ring): Candidate[] {
  const candidates: Candidate[] = [
    { method: 'atbash', shift: null, text: atbash(ciphertext, ring) },
  ]
  for (let shift = 1; shift < ring.size; shift++) {
    candidates.push({
      method: 'caesar',
      shift,
      text: caesarDecrypt(ciphertext, ring, shift),
    })
  }
  return candidates
}
