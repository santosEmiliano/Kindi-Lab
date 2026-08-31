import { useMemo, useState } from 'react'
import './App.css'
import { CipherResult } from './components/CipherResult'
import { InputPill } from './components/InputPill'
import { Subrow } from './components/Subrow'
import { ThemeToggle } from './components/ThemeToggle'
import { atbash, caesar } from './lib/preview-cipher'
import type { Method, Mode } from './types'

const SAMPLE = 'El saber es la única riqueza que un tirano no puede confiscar.'

function App() {
  const [mode, setMode] = useState<Mode>('encrypt')
  const [method, setMethod] = useState<Method>('caesar')
  const [shift, setShift] = useState(3)
  const [text, setText] = useState(SAMPLE)

  const view = mode === 'decrypt' ? 'caesar' : method

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
            onModeChange={setMode}
          />
          <Subrow mode={mode} method={method} shift={shift} onShiftChange={setShift} />
        </div>

        {mode === 'encrypt' && <CipherResult value={output} />}
      </div>
    </div>
  )
}

export default App
