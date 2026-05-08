import { useState } from 'react'
import AudioPlayer from './AudioPlayer'

export default function HighlightCorrectSummary({ question, onAnswer, onNext }) {
  const [audioEnded, setAudioEnded] = useState(false)
  const [selected, setSelected] = useState(null)

  function choose(label) { setSelected(label); onAnswer(question.id, label) }

  return (
    <div className="reading-layout">
      <div className="q-header">
        <div className="q-type-label">Highlight Correct Summary</div>
        <p className="q-instruction">Listen to the recording. Click the paragraph that best summarizes the recording.</p>
      </div>

      <AudioPlayer text={question.audio} onEnd={() => setAudioEnded(true)} />

      {audioEnded && (
        <div className="summary-options">
          {question.options.map(opt => (
            <div key={opt.label} className={`summary-option ${selected === opt.label ? 'selected' : ''}`}
              onClick={() => choose(opt.label)}>
              <strong style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>{opt.label}.</strong>
              {opt.text}
            </div>
          ))}
        </div>
      )}

      <button className="btn btn-primary" onClick={onNext} disabled={!audioEnded || !selected}>
        {!audioEnded ? 'Waiting for audio…' : !selected ? 'Select a summary' : 'Next →'}
      </button>
    </div>
  )
}
