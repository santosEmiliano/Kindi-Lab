import { useState } from 'react'
import './Histogram.css'

interface HistogramProps {
  observed: number[]
  expected: readonly number[]
  labels: readonly string[]
}

const W = 560
const H = 190
const PAD_L = 6
const PAD_R = 6
const PAD_T = 8
const PAD_B = 22

const PLOT = H - PAD_T - PAD_B
const BASE_Y = PAD_T + PLOT

const pct = (value: number) => `${(value * 100).toFixed(1)}%`

export function Histogram({ observed, expected, labels }: HistogramProps) {
  const [hover, setHover] = useState<number | null>(null)

  const n = labels.length
  const bandWidth = (W - PAD_L - PAD_R) / n
  const maxValue =
    Math.max(0.02, ...observed, ...expected) * 1.12

  const y = (value: number) => PAD_T + PLOT * (1 - value / maxValue)
  const center = (index: number) => PAD_L + index * bandWidth + bandWidth / 2

  const referencePoints = labels
    .map((_, index) => `${center(index)},${y(expected[index]).toFixed(1)}`)
    .join(' ')

  return (
    <div className="hist" onPointerLeave={() => setHover(null)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Frecuencia de cada letra en el texto cifrado frente a la frecuencia esperada del español"
      >
        <line
          x1={PAD_L}
          x2={W - PAD_R}
          y1={BASE_Y}
          y2={BASE_Y}
          stroke="var(--line)"
          strokeWidth="1"
        />

        {labels.map((label, index) => {
          const barX = PAD_L + index * bandWidth + bandWidth * 0.16
          const barY = y(observed[index])
          return (
            <g key={label}>
              <rect
                className="hist-bar"
                x={barX.toFixed(1)}
                y={barY.toFixed(1)}
                width={(bandWidth * 0.68).toFixed(1)}
                height={Math.max(0, BASE_Y - barY).toFixed(1)}
                rx="2"
                fill="var(--accent)"
                opacity={hover === index ? 1 : 0.85}
                stroke={hover === index ? 'var(--surface)' : 'none'}
                strokeWidth="2"
              />
              <text
                x={center(index).toFixed(1)}
                y={H - 8}
                fontSize="8"
                textAnchor="middle"
                fill="var(--text-mute)"
                fontFamily="var(--font-mono)"
              >
                {label}
              </text>
            </g>
          )
        })}

        <polyline
          points={referencePoints}
          fill="none"
          stroke="var(--text-dim)"
          strokeWidth="2"
          strokeDasharray="3 3"
        />
        {labels.map((label, index) => (
          <circle
            key={label}
            cx={center(index).toFixed(1)}
            cy={y(expected[index]).toFixed(1)}
            r="2"
            fill="var(--text-dim)"
          />
        ))}

        {labels.map((label, index) => (
          <rect
            key={label}
            x={(PAD_L + index * bandWidth).toFixed(1)}
            y="0"
            width={bandWidth.toFixed(1)}
            height={H}
            fill="transparent"
            onPointerEnter={() => setHover(index)}
          />
        ))}
      </svg>

      {hover !== null && (
        <div
          className="hist-tip"
          style={{ left: `${(center(hover) / W) * 100}%` }}
        >
          <span className="hist-tip-letter">{labels[hover]}</span>
          <span>
            Cifrado <b>{pct(observed[hover])}</b>
          </span>
          <span>
            Esperado <b>{pct(expected[hover])}</b>
          </span>
        </div>
      )}
    </div>
  )
}
