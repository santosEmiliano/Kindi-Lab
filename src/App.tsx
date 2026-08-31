import { useCallback, useMemo, useState } from 'react'
import './App.css'
import { CharsetPicker } from './components/CharsetPicker'
import { CharsetRing } from './components/CharsetRing'
import { CipherResult } from './components/CipherResult'
import { InputPill } from './components/InputPill'
import { MirrorBand } from './components/MirrorBand'
import { Subrow } from './components/Subrow'
import { ThemeToggle } from './components/ThemeToggle'
import { Verdict } from './components/Verdict'
import {
  atbash,
  caesar,
  detect,
  expectedSpanish,
  letterFrequencies,
  type PreviewDetection,
  ringLabels,
} from './lib/preview-cipher'
import {
  buildPreviewRing,
  CHARSET_PRESETS,
  CUSTOM_CHARSET_ID,
  MIN_RING_SIZE,
} from './lib/preview-charset'
import type { Method, Mode } from './types'

const DEFAULT_RING = buildPreviewRing(CHARSET_PRESETS[0].chars)
const SAMPLE_PLAIN = 'El saber es la única riqueza que un tirano no puede confiscar.'
const SAMPLE_CIPHER = caesar(
  'La escritura secreta se rompe contando letras, no adivinando.',
  7,
  DEFAULT_RING,
)

function App() {
  const [mode, setMode] = useState<Mode>('encrypt')
  const [method, setMethod] = useState<Method>('caesar')
  const [shift, setShift] = useState(3)
  const [charsetId, setCharsetId] = useState(CHARSET_PRESETS[0].id)
  const [customChars, setCustomChars] = useState('')
  const [values, setValues] = useState<Record<Mode, string>>({
    encrypt: SAMPLE_PLAIN,
    decrypt: SAMPLE_CIPHER,
  })
  const [detection, setDetection] = useState<PreviewDetection | null>(null)

  const source =
    charsetId === CUSTOM_CHARSET_ID
      ? customChars
      : (CHARSET_PRESETS.find((preset) => preset.id === charsetId)?.chars ?? '')

  const ring = useMemo(() => buildPreviewRing(source), [source])
  const ringValid = ring.length >= MIN_RING_SIZE
  const ringError =
    charsetId === CUSTOM_CHARSET_ID && !ringValid
      ? `El alfabeto necesita al menos ${MIN_RING_SIZE} caracteres distintos.`
      : null

  const effectiveShift = Math.min(shift, Math.max(1, ring.length - 1))
  const text = values[mode]

  const setText = useCallback(
    (value: string) => {
      setValues((prev) => ({ ...prev, [mode]: value }))
      if (mode === 'decrypt') setDetection(null)
    },
    [mode],
  )

  const changeMode = useCallback((next: Mode) => {
    setMode(next)
    setDetection(null)
  }, [])

  const changeCharset = useCallback((id: string) => {
    setCharsetId(id)
    setDetection(null)
  }, [])

  const changeCustomChars = useCallback((chars: string) => {
    setCustomChars(chars)
    setDetection(null)
  }, [])

  const run = useCallback(() => {
    if (mode === 'decrypt' && ringValid) {
      setDetection(detect(values.decrypt, ring))
    }
  }, [mode, ringValid, values.decrypt, ring])

  const view =
    mode === 'decrypt' ? (detection ? detection.method : 'caesar') : method

  const output = useMemo(() => {
    if (mode !== 'encrypt') return ''
    return method === 'atbash'
      ? atbash(text, ring)
      : caesar(text, effectiveShift, ring)
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
          presets={CHARSET_PRESETS}
          value={charsetId}
          customChars={customChars}
          error={ringError}
          onValueChange={changeCharset}
          onCustomChange={changeCustomChars}
        />

        <div className="field">
          <div className="pill-anchor">
            <CharsetRing
              letters={ring}
              shift={effectiveShift}
              active={view === 'caesar'}
              dimmed={mode === 'decrypt'}
            />
            <InputPill
              mode={mode}
              method={method}
              text={text}
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
            ringSize={ring.length}
            onShiftChange={setShift}
          />
        </div>

        {mode === 'encrypt' && <CipherResult value={output} />}

        {mode === 'decrypt' && detection && (
          <Verdict
            detection={detection}
            observed={letterFrequencies(values.decrypt)}
            expected={expectedSpanish}
            labels={ringLabels}
          />
        )}
      </main>

      <MirrorBand letters={ring} />
    </div>
  )
}

export default App
