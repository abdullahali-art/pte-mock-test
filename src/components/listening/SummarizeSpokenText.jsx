import { useState } from 'react'
import AudioPlayer from './AudioPlayer'
import Timer from '../Timer'

function countWords(s) { return s.trim() ? s.trim().split(/\s+/).length : 0 }

export default function SummarizeSpokenText({ question, onAnswer, onNext }) {
  const [audioEnded, setAudioEnded] = useState(false)
  const [text, setText] = useState('')
  const [expired, setExpired] = useState(false)
  const words = countWords(text)

  function handleNext() { onAnswer(question.id, text); onNext() }

  const wClass = words === 0 ? '' : words < 50 ? 'over' : words > 70 ? 'over' : 'ok'

  return (
    <div className="writing-layout">
      <div className="q-header">
        <div className="q-type-label">Summarize Spoken Text</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p className="q-instruction">Listen to the recording. Summarize it in 50–70 words. You have 10 minutes.</p>
          {audioEnded && <Timer seconds={question.timeLimit} onExpire={() => { setExpired(true); handleNext() }} />}
        </div>
      </div>

      <AudioPlayer text={question.audio} onEnd={() => setAudioEnded(true)} label="Plays once only" />

      <div className="writing-rules">
        📝 Write 50–70 words capturing the main points of the lecture.
      </div>

      <div className="textarea-wrap">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={audioEnded ? 'Write your summary here…' : 'Audio still playing — take notes if needed…'}
          rows={7}
          disabled={expired}
        />
        <div className="word-count">
          <span className={wClass}>{words} / 50–70 words</span>
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleNext} disabled={!audioEnded || expired}>
        {!audioEnded ? 'Waiting for audio…' : expired ? 'Time Up' : 'Next →'}
      </button>
    </div>
  )
}
