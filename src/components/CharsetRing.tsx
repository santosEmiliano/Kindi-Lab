import './CharsetRing.css'
import { useOrbitAnimation } from './useOrbitAnimation'

interface CharsetRingProps {
  letters: readonly string[]
  shift: number
  active: boolean
  dimmed: boolean
}

export function CharsetRing({ letters, shift, active, dimmed }: CharsetRingProps) {
  const { orbitRef, setCardRef } = useOrbitAnimation({
    letters,
    shift,
    active,
    dimmed,
  })

  return (
    <div className="orbit" ref={orbitRef} aria-hidden="true">
      {letters.map((letter, index) => (
        <span key={index} className="orbit-card" ref={setCardRef(index)}>
          <span className="orbit-glyph">{letter}</span>
        </span>
      ))}
    </div>
  )
}
