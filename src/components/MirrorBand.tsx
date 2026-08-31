import { type CSSProperties, useLayoutEffect, useRef, useState } from 'react'
import './MirrorBand.css'

interface MirrorBandProps {
  letters: readonly string[]
  fading?: boolean
}

export function MirrorBand({ letters, fading = false }: MirrorBandProps) {
  const n = letters.length
  const trackRef = useRef<HTMLDivElement>(null)
  const [passWidth, setPassWidth] = useState(0)

  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track || n < 1) {
      setPassWidth(0)
      return
    }
    const first = track.children[0] as HTMLElement | undefined
    const secondPass = track.children[n] as HTMLElement | undefined
    if (first && secondPass) {
      setPassWidth(secondPass.offsetLeft - first.offsetLeft)
    }
  }, [n, letters])

  return (
    <div
      className="mirror"
      aria-hidden="true"
      style={fading ? { opacity: 0 } : undefined}
    >
      <div className="axis" />
      <div
        key={n}
        ref={trackRef}
        className="track"
        style={
          passWidth
            ? ({ '--pass-width': `${passWidth}px` } as CSSProperties)
            : undefined
        }
      >
        {Array.from({ length: n * 2 }, (_, index) => {
          const i = index % n
          return (
            <div className="cell" key={index}>
              <span className="top">{letters[i]}</span>
              <span className="bot">{letters[n - 1 - i]}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
