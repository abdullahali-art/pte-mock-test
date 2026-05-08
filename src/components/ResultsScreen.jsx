import { useState, useEffect } from 'react'
import { scoreAllObjective } from '../utils/scoring'
import { generateOverallFeedback } from '../utils/gemini'

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
        .catch(() => setFeedback(null))
        .finally(() => setLoading(false))
    } else {
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
            <div className="feedback-card">
              <h4>✅ Strengths</h4>
              <p>{feedback.strengths}</p>
            </div>
            <div className="feedback-card">
              <h4>📈 Areas to Improve</h4>
              <p>{feedback.improvements}</p>
            </div>
            <div className="feedback-card">
              <h4>💡 Study Tip</h4>
              <p>{feedback.studyTip}</p>
            </div>
            <div className="feedback-card">
              <h4>🎯 Keep Going</h4>
              <p>{feedback.encouragement}</p>
            </div>
          </>
        )}

        {!apiKey && (
          <div className="feedback-card">
            <h4>ℹ️ Add API Key for AI Feedback</h4>
            <p>Add a Gemini API key to receive personalised speaking, writing, and overall feedback on your next test.</p>
          </div>
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
