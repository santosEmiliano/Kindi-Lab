import { describe, expect, it } from 'vitest'
import { buildPreviewRing, CHARSET_PRESETS } from './preview-charset'

describe('preview-charset', () => {
  it('dedupes and sorts a source by code point', () => {
    expect(buildPreviewRing('cba')).toEqual(['a', 'b', 'c'])
    expect(buildPreviewRing('AABBA')).toEqual(['A', 'B'])
    expect(buildPreviewRing('')).toEqual([])
  })

  it('sorts the Spanish preset by code point, so Ñ lands after Z', () => {
    const ring = buildPreviewRing(CHARSET_PRESETS[0].chars)
    expect(ring).toHaveLength(27)
    expect(ring.slice(0, 4)).toEqual(['A', 'B', 'C', 'D'])
    expect(ring[26]).toBe('Ñ')
  })

  it('builds a 95-character ring for the printable ASCII preset', () => {
    const ascii = CHARSET_PRESETS.find((preset) => preset.id === 'ascii-printable')
    expect(buildPreviewRing(ascii?.chars ?? '')).toHaveLength(95)
  })
})
