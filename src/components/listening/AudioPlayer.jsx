import { useState, useEffect } from 'react'
import { speak, stopSpeaking } from '../../utils/speech'

export default function AudioPlayer({ text, onEnd, autoPlay = true, label = 'Audio plays once only' }) {
  const [played, setPlayed] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (autoPlay && !played) {
      setPlayed(true)
      setPlaying(true)
      speak(text, {
        rate: 0.88,
        onEnd: () => { setPlaying(false); setProgress(100); onEnd?.() },
      })
      // Fake progress bar
      let pct = 0
      const est = text.split(' ').length * 0.45 * 1000
      const iv = setInterval(() => {
        pct = Math.min(98, pct + (100 / (est / 200)))
        setProgress(pct)
        if (pct >= 98) clearInterval(iv)
      }, 200)
      return () => { clearInterval(iv); stopSpeaking() }
    }
  }, []) // eslint-disable-line

  return (
    <div className="audio-player">
      <span className="audio-icon">{playing ? '🔊' : '✅'}</span>
      <div className="audio-info">
        <p>{playing ? 'Playing…' : played ? 'Audio finished' : 'Ready to play'}</p>
        <div className="audio-progress">
          <div className="audio-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <span className="once-note">{label}</span>
    </div>
  )
}
