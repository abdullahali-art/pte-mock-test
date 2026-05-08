import { useState, useEffect } from 'react'
import Timer from '../Timer'

function countWords(s) { return s.trim() ? s.trim().split(/\s+/).length : 0 }

export default function WriteEssay({ question, onAnswer, onNext }) {
  const [text, setText] = useState('')
  const [expired, setExpired] = useState(false)
  const words = countWords(text)
  const min = question.minWords || 200
  const max = question.maxWords || 300

  useEffect(() => { onAnswer(question.id, text) }, [text]) // eslint-disable-line

  function handleNext() { onAnswer(question.id, text); onNext() }

  const wClass = words === 0 ? '' : words < min ? 'over' : words > max ? 'over' : 'ok'

  return (
    <div className="writing-layout">
      <div className="q-header">
        <div className="q-type-label">Write Essay</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p className="q-instruction">Write a well-structured essay of {min}–{max} words in response to the prompt below.</p>
          <Timer seconds={question.timeLimit} onExpire={() => { setExpired(true); handleNext() }} />
        </div>
      </div>

      <div className="q-card" style={{ background: '#f0f4ff', border: '1.5px solid #c7d4ff' }}>
        <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--text)' }}>{question.prompt}</p>
      </div>

      <div className="writing-rules">
        ✏️ Target: <strong>{min}–{max} words</strong>. Under {min} or over {max} words incurs a score penalty.
        Structure your essay with an introduction, body paragraphs, and a conclusion.
      </div>

      <div className="textarea-wrap">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write your essay here…"
          rows={14}
          disabled={expired}
        />
        <div className="word-count">
          <span className={wClass}>{words} / {min}–{max} words</span>
          {words > 0 && words < min && <span style={{ color: 'var(--warning)', marginLeft: '0.5rem' }}>— need {min - words} more words</span>}
          {words > max && <span style={{ color: 'var(--danger)', marginLeft: '0.5rem' }}>— {words - max} over limit</span>}
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleNext} disabled={expired}>
        {expired ? 'Time Up — Saved' : 'Next →'}
      </button>
    </div>
  )
}
