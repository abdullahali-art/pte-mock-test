import { useState } from 'react'
import AudioPlayer from './AudioPlayer'

export default function FillBlanksListening({ question, onAnswer, onNext }) {
  const [audioEnded, setAudioEnded] = useState(false)
  const [answers, setAnswers] = useState(Array(question.blanks.length).fill(''))

  function setBlank(i, val) {
    const next = [...answers]
    next[i] = val
    setAnswers(next)
    onAnswer(question.id, next)
  }

  // Parse the masked audio text to render blanks inline
  const parts = question.maskedAudio.split(/(_\d+_)/)

  return (
    <div className="reading-layout">
      <div className="q-header">
        <div className="q-type-label">Listening: Fill in the Blanks</div>
        <p className="q-instruction">Listen and type the missing words exactly as you hear them. Spelling matters.</p>
      </div>

      <AudioPlayer text={question.audio} onEnd={() => setAudioEnded(true)} />

      {audioEnded && (
        <div className="q-card">
          <p className="fib-passage" style={{ lineHeight: 2.4 }}>
            {parts.map((part, i) => {
              const m = part.match(/_(\d+)_/)
              if (m) {
                const idx = parseInt(m[1]) - 1
                return (
                  <span key={i} className="fib-blank">
                    <input
                      type="text"
                      value={answers[idx] || ''}
                      onChange={e => setBlank(idx, e.target.value)}
                      placeholder={`word ${idx + 1}`}
                      style={{ width: 120 }}
                    />
                  </span>
                )
              }
              return <span key={i}>{part}</span>
            })}
          </p>
        </div>
      )}

      <button className="btn btn-primary" onClick={onNext} disabled={!audioEnded}>
        {!audioEnded ? 'Waiting for audio…' : 'Next →'}
      </button>
    </div>
  )
}
