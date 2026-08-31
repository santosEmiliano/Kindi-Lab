import { useEffect, useState } from 'react'
import './CipherResult.css'

interface CipherResultProps {
  value: string
}

export function CipherResult({ value }: CipherResultProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), 1400)
    return () => window.clearTimeout(id)
  }, [copied])

  const copy = () => {
    const clip = navigator.clipboard
    if (clip) clip.writeText(value).catch(() => undefined)
    setCopied(true)
  }

  return (
    <div className="result">
      <span className="lbl">Resultado</span>
      <p className="value">{value}</p>
      <button type="button" className="copy" onClick={copy} disabled={!value}>
        {copied ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  )
}
