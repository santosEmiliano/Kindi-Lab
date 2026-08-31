import { useCallback, useEffect, useRef } from 'react'

interface OrbitOptions {
  letters: readonly string[]
  shift: number
  active: boolean
  dimmed: boolean
}

const RX_EXTRA = 78
const RY_WIDE = 44
const RY_COMPACT = 30
const COMPACT_WIDTH = 560
const SPIN_PER_SECOND = 0.09
const SHIFT_EASE = 7
const LETTER_CYCLE = 5
const LETTER_FADE = 0.7

const smoothstep = (t: number) => t * t * (3 - 2 * t)

export function useOrbitAnimation({ letters, shift, active, dimmed }: OrbitOptions) {
  const orbitRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLSpanElement | null)[]>([])
  const inputs = useRef({ letters, shift, active, dimmed })

  useEffect(() => {
    inputs.current = { letters, shift, active, dimmed }
  })

  const setCardRef = useCallback(
    (index: number) => (node: HTMLSpanElement | null) => {
      cardsRef.current[index] = node
    },
    [],
  )

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pill = orbitRef.current
      ?.closest('.field')
      ?.querySelector<HTMLElement>('.pill')

    let raf = 0
    let last = performance.now()
    let angle = 0
    let kShown = inputs.current.shift
    let cyclePhase = 0
    let marchOffset = 0
    let marched = false
    let letterFade = 1
    let prev = ''

    const layout = () => {
      const { letters: ring, dimmed: dim } = inputs.current
      const n = ring.length
      if (!n) return
      const compact = window.innerWidth <= COMPACT_WIDTH
      const rx = (pill ? pill.getBoundingClientRect().width / 2 : 180) + RX_EXTRA
      const ry = compact ? RY_COMPACT : RY_WIDE
      const haze = (dim ? 0.4 : 1) * (compact ? 0.5 : 1)
      const rounded = Math.round(kShown)

      for (let i = 0; i < n; i++) {
        const card = cardsRef.current[i]
        if (!card) continue
        const glyph = card.firstElementChild as HTMLElement | null
        const th = -Math.PI / 2 + (i / n) * Math.PI * 2 + angle
        const depth = (Math.sin(th) + 1) / 2
        const scale = 0.6 + depth * 0.42
        const x = Math.cos(th) * rx
        const y = Math.sin(th) * ry
        const faceY = Math.cos(th) * 20
        const tiltX = (0.5 - depth) * 10
        card.style.transform =
          `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) ` +
          `rotateX(${tiltX.toFixed(1)}deg) rotateY(${faceY.toFixed(1)}deg) ` +
          `scale(${scale.toFixed(3)})`
        card.style.opacity = ((0.14 + depth * 0.6) * haze).toFixed(3)
        card.style.filter =
          depth < 0.5 ? `blur(${((0.5 - depth) * 3).toFixed(2)}px)` : 'none'
        card.style.zIndex = depth > 0.5 ? '5' : '1'
        if (glyph) {
          glyph.style.opacity = letterFade.toFixed(3)
          glyph.textContent = ring[(i + rounded + marchOffset) % n]
        }
      }
    }

    const advanceMarch = (dt: number, n: number) => {
      if (reduced) {
        letterFade = 1
        return
      }
      cyclePhase += dt
      if (cyclePhase >= LETTER_CYCLE) cyclePhase -= LETTER_CYCLE

      const fadeStart = LETTER_CYCLE - LETTER_FADE
      if (cyclePhase < fadeStart) {
        letterFade = 1
        marched = false
        return
      }
      const t = (cyclePhase - fadeStart) / (LETTER_FADE / 2)
      const raw = t < 1 ? 1 - t : t - 1
      letterFade = smoothstep(Math.max(0, Math.min(1, raw)))
      if (t >= 1 && !marched) {
        marchOffset = (marchOffset + 1) % n
        marched = true
      }
    }

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (reduced) {
        kShown = inputs.current.shift
      } else {
        if (inputs.current.active) angle -= dt * SPIN_PER_SECOND
        kShown += (inputs.current.shift - kShown) * Math.min(1, dt * SHIFT_EASE)
      }
      advanceMarch(dt, inputs.current.letters.length || 1)

      const key = `${inputs.current.active}|${angle.toFixed(4)}|${kShown.toFixed(3)}|${marchOffset}|${letterFade.toFixed(2)}|${window.innerWidth}|${inputs.current.dimmed}`
      if (inputs.current.active && key !== prev) {
        prev = key
        layout()
      }
      raf = requestAnimationFrame(frame)
    }

    layout()
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [])

  return { orbitRef, setCardRef }
}
