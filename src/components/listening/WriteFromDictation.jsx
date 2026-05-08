import { useState } from 'react'
import AudioPlayer from './AudioPlayer'

export default function WriteFromDictation({ question, onAnswer, onNext }) {
  const [audioEnded, setAudioEnded] = useState(false)
  const [text, setText] = useState('')

  function handleChange(e) {
    setText(e.target.value)
    onAnswer(question.id, e.target.value)
  }

  return (
    <div className="reading-layout">
      <div className="q-header">
        <div className="q-type-label">Write from Dictation</div>
        <p className="q-instruction">Listen to the sentence and type it exactly as you hear it. Spelling and punctuation matter.</p>
      </div>

      <AudioPlayer text={question.audio} onEnd={() => setAudioEnded(true)} label="Plays once only — type carefully" />

      {audioEnded && (
        <div>
          <input
            type="text"
            className="wfd-input"
            value={text}
            onChange={handleChange}
            placeholder="Type the sentence exactly as you heard it…"
            autoFocus
          />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            {text.trim().split(/\s+/).filter(Boolean).length} words typed
          </p>
        </div>
      )}

      <button className="btn btn-primary" onClick={onNext} disabled={!audioEnded || !text.trim()}>
        {!audioEnded ? 'Waiting for audio…' : !text.trim() ? 'Type your answer' : 'Next →'}
      </button>
    </div>
  )
}
