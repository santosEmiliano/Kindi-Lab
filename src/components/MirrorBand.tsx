import './MirrorBand.css'

const ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('')
const N = ALPHABET.length

export function MirrorBand() {
  return (
    <div className="mirror" aria-hidden="true">
      <div className="axis" />
      <div className="track">
        {Array.from({ length: N * 2 }, (_, index) => {
          const i = index % N
          return (
            <div className="cell" key={index}>
              <span className="top">{ALPHABET[i]}</span>
              <span className="bot">{ALPHABET[N - 1 - i]}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
