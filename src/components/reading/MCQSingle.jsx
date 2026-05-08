import { useState } from 'react'

export default function MCQSingle({ question, onAnswer, onNext }) {
  const [selected, setSelected] = useState(null)

  function choose(label) {
    setSelected(label)
    onAnswer(question.id, label)
  }

  return (
    <div className="reading-layout">
      <div className="q-header">
        <div className="q-type-label">Multiple Choice — Single Answer</div>
        <p className="q-instruction">Read the text and answer the question by selecting the best option.</p>
      </div>
      <div className="q-card">
        <p className="q-passage">{question.passage}</p>
      </div>
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
      <div className="btn-row">
        <button className="btn btn-primary" onClick={onNext} disabled={!selected}>Next →</button>
        {!selected && <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Select an answer to continue</span>}
      </div>
    </div>
  )
}
