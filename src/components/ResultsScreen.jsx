import { useState, useEffect } from 'react'
import { scoreAllObjective } from '../utils/scoring'
import { generateOverallFeedback } from '../utils/gemini'

const STATIC_FALLBACK = {
  spotOn: ['Test completed successfully', 'Showed engagement across all sections'],
  workOn: ['Focus on the lowest-scoring section', 'Review question types where time ran out'],
  tip: 'Practice 20 minutes daily on your weakest section using authentic PTE materials.',
}

export default function ResultsScreen({ answers, questions, apiKey, testType, onRetake }) {
  const [scores, setScores] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const realQs = questions.filter(q => q.type !== 'section-break')
    const computed = scoreAllObjective(realQs, answers)

    // Blend in any AI scores stored in answers (speaking/writing)
    const aiScored = Object.entries(answers)
      .filter(([, v]) => v && typeof v === 'object' && 'aiScore' in v)
      .map(([, v]) => v.aiScore)

    if (aiScored.length > 0) {
      // Average AI scores into speaking/writing
      const speakingAI = aiScored.filter(s => s.section === 'speaking')
      const writingAI = aiScored.filter(s => s.section === 'writing')
      if (speakingAI.length) {
        const avg = speakingAI.reduce((a, s) => a + s.overall, 0) / speakingAI.length
        computed.speaking = Math.round((computed.speaking + avg) / 2)
      }
      if (writingAI.length) {
        const avg = writingAI.reduce((a, s) => a + s.overall, 0) / writingAI.length
        computed.writing = Math.round((computed.writing + avg) / 2)
      }
      computed.overall = Math.round((computed.speaking + computed.writing + computed.reading + computed.listening) / 4)
    }

    setScores(computed)

    if (apiKey) {
      generateOverallFeedback(apiKey, { scores: computed, testType })
        .then(setFeedback)
        .finally(() => setLoading(false))
    } else {
      setFeedback(STATIC_FALLBACK)
      setLoading(false)
    }
  }, []) // eslint-disable-line

  if (loading || !scores) {
    return (
      <div className="assessing-overlay">
        <div className="spinner" />
        <p>Calculating your scores…</p>
      </div>
    )
  }

  const sections = [
    { key: 'speaking', label: 'Speaking' },
    { key: 'writing', label: 'Writing' },
    { key: 'reading', label: 'Reading' },
    { key: 'listening', label: 'Listening' },
  ]

  return (
    <div className="results-page">
      <div className="results-header">
        <h1 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Test Complete</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {testType === 'full' ? 'Full Mock Test' : 'Short Practice Test'} Results
        </p>
        <div className="overall-score">
          <span className="score-val">{scores.overall}</span>
          <span className="score-label">Overall</span>
        </div>
      </div>

      <div className="section-scores">
        {sections.map(s => (
          <div className="section-score-card" key={s.key}>
            <div className="s-label">{s.label}</div>
            <div className="s-val">{scores[s.key]}</div>
          </div>
        ))}
      </div>

      <div className="feedback-section">
        <div className="skill-bars">
          {sections.map(s => (
            <div className="skill-bar-row" key={s.key}>
              <div className="skill-bar-label">
                <span>{s.label}</span>
                <span>{scores[s.key]} / 90</span>
              </div>
              <div className="skill-bar-track">
                <div className="skill-bar-fill" style={{ width: `${(scores[s.key] / 90) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        {feedback && (
          <>
            <div className="divider" />
            <div className="ai-summary-block">
              <div className="ai-summary-header">
                <span className="ai-summary-icon">✦</span>
                AI Summary
              </div>
              <div className="ai-summary-cols">
                <div className="ai-summary-col ai-summary-col--good">
                  <div className="ai-col-label">What's working</div>
                  <ul className="ai-bullet-list">
                    {(feedback.spotOn || []).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="ai-summary-col ai-summary-col--improve">
                  <div className="ai-col-label">What to work on</div>
                  <ul className="ai-bullet-list">
                    {(feedback.workOn || []).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              {feedback.tip && (
                <div className="ai-summary-tip">
                  <span className="ai-tip-icon">💡</span>
                  {feedback.tip}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div style={{ textAlign: 'center', paddingBottom: '3rem' }}>
        <button className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.8rem 2rem' }} onClick={onRetake}>
          Back to Home
        </button>
      </div>
    </div>
  )
}
