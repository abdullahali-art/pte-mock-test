import { useState } from 'react'
import AudioPlayer from './AudioPlayer'

export default function MCQSingleListening({ question, onAnswer, onNext }) {
  const [audioEnded, setAudioEnded] = useState(false)
  const [selected, setSelected] = useState(null)

  function choose(label) { setSelected(label); onAnswer(question.id, label) }

  return (
    <div className="reading-layout">
      <div className="q-header">
        <div className="q-type-label">Listening: Multiple Choice — Single Answer</div>
        <p className="q-instruction">Listen to the recording and answer the question by selecting the best option.</p>
      </div>

      <AudioPlayer text={question.audio} onEnd={() => setAudioEnded(true)} />

      {audioEnded && (
        <div className="q-card">
          <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>{question.question}</p>
          <div className="mcq-options">
            {question.options.map(opt => (
              <label key={opt.label} className={`mcq-option ${selected === opt.label ? 'selected' : ''}`}>
                <input type="radio" name={question.id} checked={selected === opt.label} onChange={() => choose(opt.label)} />
                <span><strong>{opt.label}.</strong> {opt.text}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <button className="btn btn-primary" onClick={onNext} disabled={!audioEnded || !selected}>
        {!audioEnded ? 'Waiting for audio…' : !selected ? 'Select an answer' : 'Next →'}
      </button>
    </div>
  )
}
