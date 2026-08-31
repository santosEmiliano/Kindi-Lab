import { describe, expect, it } from 'vitest'
import { foldToLatin } from './normalize'

describe('foldToLatin', () => {
  it('lowercases and keeps only a-z', () => {
    expect(foldToLatin('Hola, Mundo 123!')).toBe('holamundo')
  })

  it('folds Spanish accents and enye to their base letters', () => {
    expect(foldToLatin('El niño se cayó de la cama')).toBe(
      'elninosecayodelacama',
    )
  })

  it('drops the diaeresis', () => {
    expect(foldToLatin('pingüino')).toBe('pinguino')
  })

  it('returns an empty string when there is no Latin letter', () => {
    expect(foldToLatin('¡123 — !!')).toBe('')
  })
})
