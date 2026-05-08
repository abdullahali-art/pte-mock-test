import { useState } from 'react'

export default function MCQMultiple({ question, onAnswer, onNext }) {
  const [selected, setSelected] = useState([])

  function toggle(label) {
    const next = selected.includes(label) ? selected.filter(s => s !== label) : [...selected, label]
    setSelected(next)
    onAnswer(question.id, next)
  }

  return (
    <div className="reading-layout">
      <div className="q-header">
        <div className="q-type-label">Multiple Choice — Multiple Answers</div>
        <p className="q-instruction">Read the text and answer the question. More than one answer is correct.</p>
      </div>
      <div className="negative-warning">⚠️ <strong>Negative marking:</strong> Each wrong answer deducts one point from correct answers. Only select answers you are confident about.</div>
      <div className="q-card">
        <p className="q-passage">{question.passage}</p>
      </div>
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
      <div className="btn-row">
        <button className="btn btn-primary" onClick={onNext}>Next →</button>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
          {selected.length} selected
        </span>
      </div>
    </div>
  )
}
