import { useState } from 'react'

export default function ReadingFIB({ question, onAnswer, onNext }) {
  const [answers, setAnswers] = useState({})

  function setBlank(id, val) {
    const next = { ...answers, [id]: val }
    setAnswers(next)
    onAnswer(question.id, next)
  }

  // Render passage with drag-and-drop word bank blanks
  const parts = question.passage.split(/(__\d+__)/)

  return (
    <div className="reading-layout">
      <div className="q-header">
        <div className="q-type-label">Reading: Fill in the Blanks</div>
        <p className="q-instruction">A word is missing in each blank. Select the correct word from the dropdown options for each blank.</p>
      </div>
      <div className="q-card">
        <p className="fib-passage">
          {parts.map((part, i) => {
            const match = part.match(/__(\d+)__/)
            if (match) {
              const blankId = parseInt(match[1])
              const blank = question.blanks.find(b => b.id === blankId)
              if (!blank) return null
              return (
                <select key={i} className="fib-select" value={answers[blankId] || ''} onChange={e => setBlank(blankId, e.target.value)}>
                  <option value="">— select —</option>
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
