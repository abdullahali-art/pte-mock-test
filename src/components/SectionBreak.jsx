export default function SectionBreak({ question, onNext }) {
  return (
    <div className="section-break">
      <div className="section-break-card">
        <div className="section-icon">{question.icon}</div>
        <h2>{question.title} Section</h2>
        <p>Estimated time: {question.duration}</p>
        <ul className="section-rules">
          {question.rules.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={onNext}>
          Begin {question.title} Section →
        </button>
      </div>
    </div>
  )
}
