import './CharsetRing.css'
import { useOrbitAnimation } from './useOrbitAnimation'

const ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('')

interface CharsetRingProps {
  shift: number
  active: boolean
  dimmed: boolean
}

export function CharsetRing({ shift, active, dimmed }: CharsetRingProps) {
  const { orbitRef, setCardRef } = useOrbitAnimation({
    letters: ALPHABET,
    shift,
    active,
    dimmed,
  })

  return (
    <div className="orbit" ref={orbitRef} aria-hidden="true">
      {ALPHABET.map((letter, index) => (
        <span key={letter} className="orbit-card" ref={setCardRef(index)}>
          <span className="orbit-glyph">{letter}</span>
        </span>
      ))}
    </div>
  )
}
