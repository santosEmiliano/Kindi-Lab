import { useCallback, useMemo, useState } from 'react'
import './App.css'
import { CipherResult } from './components/CipherResult'
import { InputPill } from './components/InputPill'
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
import type { Method, Mode } from './types'

const SAMPLE_PLAIN = 'El saber es la única riqueza que un tirano no puede confiscar.'
const SAMPLE_CIPHER = caesar(
  'La escritura secreta se rompe contando letras, no adivinando.',
  7,
)

function App() {
  const [mode, setMode] = useState<Mode>('encrypt')
  const [method, setMethod] = useState<Method>('caesar')
  const [shift, setShift] = useState(3)
  const [values, setValues] = useState<Record<Mode, string>>({
    encrypt: SAMPLE_PLAIN,
    decrypt: SAMPLE_CIPHER,
  })
  const [detection, setDetection] = useState<PreviewDetection | null>(null)

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

  const run = useCallback(() => {
    if (mode === 'decrypt') setDetection(detect(values.decrypt))
  }, [mode, values.decrypt])

  const view =
    mode === 'decrypt' ? (detection ? detection.method : 'caesar') : method

  const output = useMemo(() => {
    if (mode !== 'encrypt') return ''
    return method === 'atbash' ? atbash(text) : caesar(text, shift)
  }, [mode, method, shift, text])

  return (
    <div className="stage" data-mode={mode} data-view={view}>
      <div className="glow" aria-hidden="true" />
      <ThemeToggle />

      <div className="core">
        <header className="head">
          <h1 className="mark">Kindi Lab</h1>
          <p className="tag">
            Cifra con César o Atbash sobre el alfabeto español. Descífralo sin la llave
            (método de al-Kindi, Bagdad, 850&nbsp;d.C.)
          </p>
        </header>

        <div className="field">
          <InputPill
            mode={mode}
            method={method}
            text={text}
            onTextChange={setText}
            onMethodChange={setMethod}
            onModeChange={changeMode}
            onRun={run}
          />
          <Subrow mode={mode} method={method} shift={shift} onShiftChange={setShift} />
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
      </div>
    </div>
  )
}

export default App
