import { useState } from 'react'
import AudioPlayer from './AudioPlayer'

export default function SelectMissingWord({ question, onAnswer, onNext }) {
  const [audioEnded, setAudioEnded] = useState(false)
  const [selected, setSelected] = useState(null)

  function choose(opt) { setSelected(opt); onAnswer(question.id, opt) }

  return (
    <div className="reading-layout">
      <div className="q-header">
        <div className="q-type-label">Select Missing Word</div>
        <p className="q-instruction">Listen to the recording. The last word or group of words has been replaced by a beep. Select the option that best completes the recording.</p>
      </div>

      <AudioPlayer text={question.audio + ' …'} onEnd={() => setAudioEnded(true)} />

      {audioEnded && (
        <div className="q-card">
          <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Which word or phrase best completes the recording?</p>
          <div className="mcq-options">
            {question.options.map(opt => (
              <label key={opt} className={`mcq-option ${selected === opt ? 'selected' : ''}`}>
                <input type="radio" name={question.id} checked={selected === opt} onChange={() => choose(opt)} />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <button className="btn btn-primary" onClick={onNext} disabled={!audioEnded || !selected}>
        {!audioEnded ? 'Waiting for audio…' : !selected ? 'Select an option' : 'Next →'}
      </button>
    </div>
  )
}
