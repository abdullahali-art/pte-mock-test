export default function HomeScreen({ onStart, onDevResults }) {
  return (
    <div className="home">
      <div className="home-logo">PTE <span>Mock</span></div>
      <p className="home-subtitle">Academic English Test — AI-Powered Practice</p>
      <div className="home-cards">
        <div className="test-card" onClick={() => onStart('full')}>
          <div className="card-icon">📋</div>
          <h2>Full Mock Test</h2>
          <p>All 20 question types across Speaking, Writing, Reading, and Listening sections.</p>
          <span className="card-badge">~2 hrs · ~65 questions</span>
        </div>
        <div className="test-card" onClick={() => onStart('short')}>
          <div className="card-icon">⚡</div>
          <h2>Short Practice Test</h2>
          <p>A condensed test covering all task types with fewer questions per section.</p>
          <span className="card-badge">~30 mins · ~31 questions</span>
        </div>
      </div>
      {import.meta.env.DEV && (
        <button className="dev-skip-btn" onClick={onDevResults}>
          ⚙ Skip to Results (dev only)
        </button>
      )}
    </div>
  )
}
