import { useMemo, useState } from 'react'
import {
  buildRing,
  CHARSET_PRESETS,
  type CharsetPresetId,
} from './lib/charset'
import { atbash, caesarDecrypt, caesarEncrypt } from './lib/ciphers'

type Mode = 'encrypt' | 'decrypt'
type Method = 'caesar' | 'atbash'
type CharsetChoice = CharsetPresetId | 'custom'

function App() {
  const [mode, setMode] = useState<Mode>('encrypt')
  const [method, setMethod] = useState<Method>('caesar')
  const [charset, setCharset] = useState<CharsetChoice>('spanish-upper')
  const [customChars, setCustomChars] = useState('')
  const [shift, setShift] = useState(3)
  const [text, setText] = useState('')

  const source =
    charset === 'custom' ? customChars : CHARSET_PRESETS[charset].chars

  const ring = useMemo(() => {
    try {
      return { value: buildRing(source), error: null as string | null }
    } catch (error) {
      return { value: null, error: (error as Error).message }
    }
  }, [source])

  const output = useMemo(() => {
    if (!ring.value) return ''
    if (method === 'atbash') return atbash(text, ring.value)
    return mode === 'encrypt'
      ? caesarEncrypt(text, ring.value, shift)
      : caesarDecrypt(text, ring.value, shift)
  }, [ring.value, method, mode, shift, text])

  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Kindi Lab</h1>
      <p className="text-sm text-neutral-500">
        Banco de pruebas de la lógica. La interfaz definitiva viene después.
      </p>

      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Acción
          <select
            className="rounded border border-neutral-300 bg-transparent px-2 py-1"
            value={mode}
            onChange={(event) => setMode(event.target.value as Mode)}
          >
            <option value="encrypt">Cifrar</option>
            <option value="decrypt">Descifrar</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Método
          <select
            className="rounded border border-neutral-300 bg-transparent px-2 py-1"
            value={method}
            onChange={(event) => setMethod(event.target.value as Method)}
          >
            <option value="caesar">César</option>
            <option value="atbash">Atbash</option>
          </select>
        </label>

        {method === 'caesar' && (
          <label className="flex flex-col gap-1 text-sm">
            Desplazamiento
            <input
              className="w-24 rounded border border-neutral-300 bg-transparent px-2 py-1"
              type="number"
              value={shift}
              onChange={(event) => setShift(Number(event.target.value) || 0)}
            />
          </label>
        )}
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Charset
        <select
          className="rounded border border-neutral-300 bg-transparent px-2 py-1"
          value={charset}
          onChange={(event) => setCharset(event.target.value as CharsetChoice)}
        >
          {Object.entries(CHARSET_PRESETS).map(([id, preset]) => (
            <option key={id} value={id}>
              {preset.label}
            </option>
          ))}
          <option value="custom">Personalizado</option>
        </select>
      </label>

      {charset === 'custom' && (
        <label className="flex flex-col gap-1 text-sm">
          Caracteres del anillo
          <input
            className="rounded border border-neutral-300 bg-transparent px-2 py-1 font-mono"
            value={customChars}
            onChange={(event) => setCustomChars(event.target.value)}
            placeholder="ABCDEFGHIJKLMNÑOPQRSTUVWXYZ"
          />
        </label>
      )}

      {ring.value && (
        <p className="text-xs text-neutral-500">
          Anillo de {ring.value.size} caracteres.
        </p>
      )}
      {ring.error && <p className="text-xs text-red-600">{ring.error}</p>}

      <label className="flex flex-col gap-1 text-sm">
        Texto
        <textarea
          className="min-h-32 rounded border border-neutral-300 bg-transparent p-2 font-mono"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </label>

      <div className="flex flex-col gap-1 text-sm">
        <div className="flex items-center justify-between">
          <span>Resultado</span>
          <button
            type="button"
            className="rounded border border-neutral-300 px-2 py-0.5 text-xs disabled:opacity-40"
            disabled={!output}
            onClick={() => navigator.clipboard.writeText(output)}
          >
            Copiar
          </button>
        </div>
        <pre className="min-h-32 overflow-x-auto whitespace-pre-wrap rounded border border-neutral-300 p-2 font-mono">
          {output}
        </pre>
      </div>
    </main>
  )
}

export default App
