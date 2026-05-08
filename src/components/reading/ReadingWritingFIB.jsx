import { useState } from 'react'

export default function ReadingWritingFIB({ question, onAnswer, onNext }) {
  const [answers, setAnswers] = useState({})

  function setBlank(id, val) {
    const next = { ...answers, [id]: val }
    setAnswers(next)
    onAnswer(question.id, next)
  }

  const parts = question.passage.split(/(__\d+__)/)

  return (
    <div className="reading-layout">
      <div className="q-header">
        <div className="q-type-label">Reading &amp; Writing: Fill in the Blanks</div>
        <p className="q-instruction">For each blank choose the most appropriate word from the dropdown. This task assesses both reading comprehension and vocabulary knowledge.</p>
      </div>
      <div className="q-card">
        <p className="fib-passage" style={{ lineHeight: 2.4 }}>
          {parts.map((part, i) => {
            const match = part.match(/__(\d+)__/)
            if (match) {
              const blankId = parseInt(match[1])
              const blank = question.blanks.find(b => b.id === blankId)
              if (!blank) return null
              const chosen = answers[blankId] || ''
              return (
                <select key={i} className="fib-select"
                  value={chosen}
                  onChange={e => setBlank(blankId, e.target.value)}
                  style={{ borderColor: chosen ? 'var(--primary)' : 'var(--border)' }}>
                  <option value="">— choose —</option>
                  {blank.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              )
            }
            return <span key={i}>{part}</span>
          })}
        </p>
      </div>
      <button className="btn btn-primary" onClick={onNext}>Next →</button>
    </div>
  )
}
