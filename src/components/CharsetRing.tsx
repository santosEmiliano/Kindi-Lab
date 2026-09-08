import './CharsetRing.css'
import { MAX_VISIBLE_CARDS } from './ring-window'
import { useOrbitAnimation } from './useOrbitAnimation'

interface CharsetRingProps {
  letters: readonly string[]
  shift: number
  active: boolean
  dimmed: boolean
  fading?: boolean
}

export function CharsetRing({
  letters,
  shift,
  active,
  dimmed,
  fading = false,
}: CharsetRingProps) {
  const visible = letters.slice(0, MAX_VISIBLE_CARDS)
  const { orbitRef, setCardRef } = useOrbitAnimation({
    letters,
    visibleCount: visible.length,
    shift,
    active,
    dimmed,
  })

  return (
    <div
      className="orbit"
      ref={orbitRef}
      aria-hidden="true"
      style={fading ? { opacity: 0 } : undefined}
    >
      {visible.map((letter, index) => (
        <span key={index} className="orbit-card" ref={setCardRef(index)}>
          <span className="orbit-glyph">{letter}</span>
        </span>
      ))}
    </div>
  )
}
