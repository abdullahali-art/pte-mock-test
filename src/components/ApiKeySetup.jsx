import { useState } from 'react'

export default function ApiKeySetup({ onSave, onBack }) {
  const [key, setKey] = useState('')
  const [error, setError] = useState('')
  const [testing, setTesting] = useState(false)

  async function handleSave() {
    const trimmed = key.trim()
    if (!trimmed) { setError('Please enter your Gemini API key.'); return }
    setTesting(true)
    setError('')
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${trimmed}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: 'Say OK' }] }] }),
        }
      )
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error?.message || 'Invalid API key. Please check and try again.')
        setTesting(false)
        return
      }
      onSave(trimmed)
    } catch {
      setError('Could not reach Gemini API. Check your internet connection.')
      setTesting(false)
    }
  }

  return (
    <div className="setup-page">
      <div className="setup-card">
        <h2>Gemini API Key Required</h2>
        <p>
          This app uses Google Gemini to assess your speaking and writing responses.
          Get a free key at{' '}
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">
            aistudio.google.com
          </a>
          . Your key is stored locally and never sent to any server other than Google.
        </p>
        <div className="input-group">
          <label>Gemini API Key</label>
          <input
            type="password"
            placeholder="AIza..."
            value={key}
            onChange={e => { setKey(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
        </div>
        {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}
        <div className="btn-row">
          <button className="btn btn-primary" onClick={handleSave} disabled={testing}>
            {testing ? 'Verifying…' : 'Save & Start Test'}
          </button>
          <button className="btn btn-secondary" onClick={onBack}>Back</button>
        </div>
      </div>
    </div>
  )
}
