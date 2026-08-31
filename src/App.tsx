import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { CharsetPicker } from './components/CharsetPicker'
import { CharsetRing } from './components/CharsetRing'
import { CipherResult } from './components/CipherResult'
import { InputPill } from './components/InputPill'
import { MirrorBand } from './components/MirrorBand'
import { Subrow } from './components/Subrow'
import { ThemeToggle } from './components/ThemeToggle'
import { Verdict } from './components/Verdict'
import { atbash, caesarEncrypt } from './lib/ciphers'
import { buildRing, type Ring } from './lib/charset'
import {
  CUSTOM_CHARSET_ID,
  DEFAULT_CHARSET_ID,
  MIN_RING_SIZE,
  PRESET_OPTIONS,
} from './lib/charsets'
import { detectCipher, type DetectionResult } from './lib/detect/select'
import { loadSpanishData, type SpanishData } from './lib/spanish-data'
import {
  expectedFrequencies,
  HISTOGRAM_LABELS,
  letterHistogram,
} from './lib/letter-histogram'
import type { Method, Mode } from './types'

const EMPTY_CHARS: readonly string[] = []
const DEFAULT_RING = buildRing(
  PRESET_OPTIONS.find((preset) => preset.id === DEFAULT_CHARSET_ID)?.chars ?? '',
)
const SAMPLE_PLAIN = 'EL SABER ES LA UNICA RIQUEZA QUE UN TIRANO NO PUEDE CONFISCAR.'
const SAMPLE_CIPHER = caesarEncrypt(
  'LA ESCRITURA SECRETA SE ROMPE CONTANDO LETRAS, NO ADIVINANDO.',
  DEFAULT_RING,
  7,
)

function App() {
  const [mode, setMode] = useState<Mode>('encrypt')
  const [method, setMethod] = useState<Method>('caesar')
  const [shift, setShift] = useState(3)
  const [charsetId, setCharsetId] = useState<string>(DEFAULT_CHARSET_ID)
  const [displayCharsetId, setDisplayCharsetId] = useState<string>(DEFAULT_CHARSET_ID)
  const [customChars, setCustomChars] = useState('')
  const [values, setValues] = useState<Record<Mode, string>>({
    encrypt: SAMPLE_PLAIN,
    decrypt: SAMPLE_CIPHER,
  })
  const [detection, setDetection] = useState<DetectionResult | null>(null)
  const [spanishData, setSpanishData] = useState<SpanishData | null>(null)
  const [detecting, setDetecting] = useState(false)
  const [detectError, setDetectError] = useState<string | null>(null)
  const [charsetFading, setCharsetFading] = useState(false)
  const fadeTimer = useRef<number>(undefined)

  useEffect(() => () => window.clearTimeout(fadeTimer.current), [])

  const resetDetection = useCallback(() => {
    setDetection(null)
    setDetectError(null)
  }, [])

  const ring = useMemo<Ring | null>(() => {
    const chars =
      charsetId === CUSTOM_CHARSET_ID
        ? customChars
        : (PRESET_OPTIONS.find((preset) => preset.id === charsetId)?.chars ?? '')
    return new Set(chars).size >= MIN_RING_SIZE ? buildRing(chars) : null
  }, [charsetId, customChars])

  const displayRing = useMemo<Ring | null>(() => {
    const chars =
      displayCharsetId === CUSTOM_CHARSET_ID
        ? customChars
        : (PRESET_OPTIONS.find((preset) => preset.id === displayCharsetId)?.chars ??
          '')
    return new Set(chars).size >= MIN_RING_SIZE ? buildRing(chars) : null
  }, [displayCharsetId, customChars])
  const ringValid = ring !== null
  const ringSize = ring?.size ?? 0
  const ringError =
    charsetId === CUSTOM_CHARSET_ID && !ringValid
      ? `El alfabeto necesita al menos ${MIN_RING_SIZE} caracteres distintos.`
      : null

  const effectiveShift = Math.min(shift, Math.max(1, ringSize - 1))
  const text = values[mode]

  const setText = useCallback(
    (value: string) => {
      setValues((prev) => ({ ...prev, [mode]: value }))
      if (mode === 'decrypt') resetDetection()
    },
    [mode, resetDetection],
  )

  const changeMode = useCallback(
    (next: Mode) => {
      setMode(next)
      resetDetection()
    },
    [resetDetection],
  )

  const changeCharset = useCallback(
    (id: string) => {
      setCharsetId(id)
      resetDetection()
      window.clearTimeout(fadeTimer.current)
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setDisplayCharsetId(id)
        setCharsetFading(false)
        return
      }
      setCharsetFading(true)
      fadeTimer.current = window.setTimeout(() => {
        setDisplayCharsetId(id)
        setCharsetFading(false)
      }, 260)
    },
    [resetDetection],
  )

  const changeCustomChars = useCallback(
    (chars: string) => {
      setCustomChars(chars)
      resetDetection()
    },
    [resetDetection],
  )

  const run = useCallback(() => {
    if (mode !== 'decrypt' || !ring) return
    const ciphertext = values.decrypt
    setDetecting(true)
    setDetectError(null)
    loadSpanishData()
      .then((data) => {
        setSpanishData(data)
        setDetection(detectCipher(ciphertext, ring, data))
      })
      .catch(() => {
        setDetectError(
          'No se pudieron cargar los datos del español. Revisa la conexión e inténtalo otra vez.',
        )
      })
      .finally(() => setDetecting(false))
  }, [mode, ring, values.decrypt])

  const view =
    mode === 'decrypt' ? (detection ? detection.method : 'caesar') : method

  const output = useMemo(() => {
    if (mode !== 'encrypt' || !ring) return ''
    return method === 'atbash'
      ? atbash(text, ring)
      : caesarEncrypt(text, ring, effectiveShift)
  }, [mode, method, effectiveShift, text, ring])

  return (
    <div className="stage" data-mode={mode} data-view={view}>
      <div className="glow" aria-hidden="true" />
      <ThemeToggle />

      <main className="core">
        <header className="head">
          <h1 className="mark">Kindi Lab</h1>
          <p className="tag">
            Cifra con César o Atbash sobre el alfabeto español. Descífralo sin la llave
            (método de al-Kindi, Bagdad, 850&nbsp;d.C.)
          </p>
        </header>

        <CharsetPicker
          presets={PRESET_OPTIONS}
          value={charsetId}
          customChars={customChars}
          error={ringError}
          onValueChange={changeCharset}
          onCustomChange={changeCustomChars}
        />

        <div className="field">
          <div className="pill-anchor">
            <CharsetRing
              letters={displayRing?.chars ?? EMPTY_CHARS}
              shift={effectiveShift}
              active={view === 'caesar'}
              dimmed={mode === 'decrypt'}
              fading={charsetFading}
            />
            <InputPill
              mode={mode}
              method={method}
              text={text}
              busy={detecting}
              onTextChange={setText}
              onMethodChange={setMethod}
              onModeChange={changeMode}
              onRun={run}
            />
          </div>
          <Subrow
            mode={mode}
            method={method}
            shift={effectiveShift}
            ringSize={ringSize}
            onShiftChange={setShift}
          />
        </div>

        {mode === 'encrypt' && <CipherResult value={output} />}

        {mode === 'decrypt' && detecting && (
          <p className="detect-status" aria-live="polite">
            Analizando el texto contra el español…
          </p>
        )}

        {mode === 'decrypt' && detectError && (
          <p className="detect-status is-error" role="alert">
            {detectError}
          </p>
        )}

        {mode === 'decrypt' && detection && spanishData && (
          <Verdict
            detection={detection}
            observed={letterHistogram(values.decrypt)}
            expected={expectedFrequencies(spanishData.letterFrequencies)}
            labels={HISTOGRAM_LABELS}
          />
        )}
      </main>

      <MirrorBand letters={displayRing?.chars ?? EMPTY_CHARS} fading={charsetFading} />
    </div>
  )
}

export default App
