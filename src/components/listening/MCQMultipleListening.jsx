import { useState } from 'react'
import AudioPlayer from './AudioPlayer'

export default function MCQMultipleListening({ question, onAnswer, onNext }) {
  const [audioEnded, setAudioEnded] = useState(false)
  const [selected, setSelected] = useState([])

  function toggle(label) {
    const next = selected.includes(label) ? selected.filter(s => s !== label) : [...selected, label]
    setSelected(next)
    onAnswer(question.id, next)
  }

  return (
    <div className="reading-layout">
      <div className="q-header">
        <div className="q-type-label">Listening: Multiple Choice — Multiple Answers</div>
        <p className="q-instruction">Listen to the recording and answer the question. More than one answer may be correct.</p>
      </div>
      <div className="negative-warning">⚠️ <strong>Negative marking:</strong> Wrong answers deduct points. Select only answers you're confident about.</div>

      <AudioPlayer text={question.audio} onEnd={() => setAudioEnded(true)} />

      {audioEnded && (
        <div className="q-card">
          <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>{question.question}</p>
          <div className="mcq-options">
            {question.options.map(opt => (
              <label key={opt.label} className={`mcq-option ${selected.includes(opt.label) ? 'selected' : ''}`}>
                <input type="checkbox" checked={selected.includes(opt.label)} onChange={() => toggle(opt.label)} />
                <span><strong>{opt.label}.</strong> {opt.text}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <button className="btn btn-primary" onClick={onNext} disabled={!audioEnded}>
        {!audioEnded ? 'Waiting for audio…' : 'Next →'}
      </button>
    </div>
  )
}
