import { useState } from 'react'
import AudioPlayer from './AudioPlayer'

export default function HighlightIncorrectWords({ question, onAnswer, onNext }) {
  const [audioEnded, setAudioEnded] = useState(false)
  const [selected, setSelected] = useState([])

  function toggle(word) {
    const next = selected.includes(word) ? selected.filter(w => w !== word) : [...selected, word]
    setSelected(next)
    onAnswer(question.id, next)
  }

  return (
    <div className="reading-layout">
      <div className="q-header">
        <div className="q-type-label">Highlight Incorrect Words</div>
        <p className="q-instruction">Listen to the recording and click on any words in the text that differ from what the speaker says.</p>
      </div>
      <div className="negative-warning">⚠️ <strong>Negative marking:</strong> Incorrectly highlighted words reduce your score. Only click words you're sure are wrong.</div>

      <AudioPlayer text={question.audio} onEnd={() => setAudioEnded(true)} />

      {audioEnded && (
        <div className="q-card">
          <p className="hiw-passage">
            {question.transcript.map((w, i) => (
              <span key={i}>
                <span
                  className={`hiw-word ${selected.includes(w.word) ? 'selected' : ''}`}
                  onClick={() => toggle(w.word)}>
                  {w.word}
                </span>
                {' '}
              </span>
            ))}
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
            {selected.length} word{selected.length !== 1 ? 's' : ''} highlighted
          </p>
        </div>
      )}

      <button className="btn btn-primary" onClick={onNext} disabled={!audioEnded}>
        {!audioEnded ? 'Waiting for audio…' : 'Next →'}
      </button>
    </div>
  )
}
