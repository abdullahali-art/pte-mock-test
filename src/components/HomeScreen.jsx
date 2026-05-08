export default function HomeScreen({ onStart, savedApiKey }) {
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
      <p className="home-note">Questions are randomly selected without repetition across up to 10 tests.</p>
      {savedApiKey
        ? <p className="home-api-status">✓ Gemini API key saved — AI assessment enabled</p>
        : <p className="home-api-status">No API key yet — you'll be prompted before the test starts</p>
      }
    </div>
  )
}
