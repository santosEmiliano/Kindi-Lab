import './Verdict.css'
import type { PreviewDetection } from '../lib/preview-cipher'
import { Histogram } from './Histogram'

interface VerdictProps {
  detection: PreviewDetection
  observed: number[]
  expected: readonly number[]
  labels: readonly string[]
}

function confidenceWord(value: number): 'alta' | 'media' | 'baja' {
  if (value >= 0.66) return 'alta'
  if (value >= 0.33) return 'media'
  return 'baja'
}

export function Verdict({ detection, observed, expected, labels }: VerdictProps) {
  const { plaintext, method, shift, confidence } = detection
  const word = confidenceWord(confidence)
  const percent = Math.round(confidence * 100)
  const barWidth = Math.max(6, percent)
  const badge =
    method === 'caesar' ? `César · desplazamiento ${shift}` : 'Atbash · sin llave'

  return (
    <div className="verdict">
      <div>
        <span className="lbl">Texto descifrado</span>
        <p className="plain">{plaintext}</p>
      </div>

      <div className="meta">
        <span className="badge">{badge}</span>
        <span className="conf">
          <span className="conf-top">
            <span>Confianza</span>
            <span>
              {word} · {percent}%
            </span>
          </span>
          <span className="conf-track">
            <span
              className={word === 'baja' ? 'conf-fill low' : 'conf-fill'}
              style={{ width: `${barWidth}%` }}
            />
          </span>
        </span>
      </div>

      <p className="vnote">
        Evaluó Atbash y cada desplazamiento de César, y se quedó con la única lectura
        que puntúa como español.
      </p>

      <details className="analysis">
        <summary>Ver análisis de frecuencias</summary>
        <figure>
          <div className="legend">
            <span>
              <i className="swatch-bar" />
              Texto cifrado
            </span>
            <span>
              <i className="swatch-line" />
              Español esperado
            </span>
          </div>
          <Histogram observed={observed} expected={expected} labels={labels} />
          <figcaption>
            Frecuencia de cada letra en el texto cifrado frente al español. La
            combinación cuyas barras más se acercan a la línea es la que Kindi Lab
            elige, sin intervención humana.
          </figcaption>
        </figure>
      </details>
    </div>
  )
}
