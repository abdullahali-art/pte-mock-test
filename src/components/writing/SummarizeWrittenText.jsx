import { useState, useEffect, useRef } from 'react'
import Timer from '../Timer'

function countWords(s) { return s.trim() ? s.trim().split(/\s+/).length : 0 }
function countSentences(s) { return (s.match(/[.!?]+/g) || []).length }

export default function SummarizeWrittenText({ question, onAnswer, onNext }) {
  const [text, setText] = useState('')
  const [expired, setExpired] = useState(false)
  const words = countWords(text)
  const sentences = countSentences(text)
  const valid = words >= 5 && words <= 75 && sentences === 1

  useEffect(() => { onAnswer(question.id, text) }, [text]) // eslint-disable-line

  function handleNext() { onAnswer(question.id, text); onNext() }

  const wClass = words === 0 ? '' : words < 5 ? 'over' : words > 75 ? 'over' : 'ok'

  return (
    <div className="writing-layout">
      <div className="q-header">
        <div className="q-type-label">Summarize Written Text</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p className="q-instruction">Read the passage and summarize it in ONE sentence (5–75 words). A second sentence = score 0.</p>
          <Timer seconds={question.timeLimit} onExpire={() => { setExpired(true); handleNext() }} />
        </div>
      </div>

      <div className="q-card">
        <p className="q-passage">{question.passage}</p>
      </div>

      <div className="writing-rules">
        ⚠️ <strong>Critical rule:</strong> Exactly ONE sentence ending with a single full stop. 5–75 words. Any violation = 0 marks.
      </div>

      <div className="textarea-wrap">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write your one-sentence summary here…"
          rows={5}
          disabled={expired}
        />
        <div className="word-count">
          <span className={wClass}>{words} words</span>
          {' · '}
          <span className={sentences === 1 ? 'ok' : sentences === 0 ? '' : 'over'}>{sentences} sentence{sentences !== 1 ? 's' : ''}</span>
          {!valid && words > 0 && <span style={{ color: 'var(--danger)', marginLeft: '0.5rem' }}>
            {words < 5 ? '— too short' : words > 75 ? '— too long' : sentences !== 1 ? '— must be exactly 1 sentence' : ''}
          </span>}
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleNext} disabled={expired}>
        {expired ? 'Time Up — Saved' : 'Next →'}
      </button>
    </div>
  )
}
