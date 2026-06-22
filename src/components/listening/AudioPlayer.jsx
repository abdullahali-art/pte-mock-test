import { useState, useEffect, useRef } from 'react'
import { speak, stopSpeaking } from '../../utils/speech'

export default function AudioPlayer({
  text,
  onEnd,
  autoPlay = true,
  prepTime = 7,
  label = 'Audio plays once only',
}) {
  const [phase, setPhase] = useState(autoPlay && prepTime > 0 ? 'prep' : 'playing')
  const [countdown, setCountdown] = useState(prepTime)
  const [progress, setProgress] = useState(0)
  const [stalled, setStalled] = useState(false)
  const startedRef = useRef(false)
  const watchdogRef = useRef(null)
  const progressRef = useRef(null)

  useEffect(() => {
    if (phase !== 'prep') return
    if (countdown <= 0) { setPhase('playing'); return }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, countdown])

  useEffect(() => {
    if (phase !== 'playing' || startedRef.current) return
    startedRef.current = true
    playAudio()
    return () => {
      clearInterval(progressRef.current)
      clearTimeout(watchdogRef.current)
      stopSpeaking()
    }
  }, [phase]) // eslint-disable-line

  function playAudio() {
    setStalled(false)
    setProgress(0)
    const wordCount = text.split(/\s+/).filter(Boolean).length
    const est = Math.max(3000, wordCount * 450)

    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      clearInterval(progressRef.current)
      clearTimeout(watchdogRef.current)
      setProgress(100)
      setPhase('done')
      onEnd?.()
    }

    speak(text, { rate: 0.88, onEnd: finish })

    let pct = 0
    progressRef.current = setInterval(() => {
      pct = Math.min(98, pct + (100 / (est / 200)))
      setProgress(pct)
      if (pct >= 98) clearInterval(progressRef.current)
    }, 200)

    // Watchdog: if TTS hasn't finished after 2x estimated time, treat as stalled.
    watchdogRef.current = setTimeout(() => {
      if (!finished) setStalled(true)
    }, est * 2 + 2000)
  }

  function retry() {
    stopSpeaking()
    startedRef.current = false
    setPhase('playing')
  }

  function skipPrep() {
    if (phase === 'prep') setPhase('playing')
  }

  return (
    <div className="audio-player">
      {phase === 'prep' ? (
        <>
          <span className="audio-icon">⏳</span>
          <div className="audio-info">
            <p>Audio begins in {countdown} second{countdown === 1 ? '' : 's'} — read the instructions now.</p>
            <div className="audio-progress">
              <div className="audio-progress-fill" style={{ width: `${((prepTime - countdown) / prepTime) * 100}%` }} />
            </div>
          </div>
          <button className="btn btn-secondary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem' }} onClick={skipPrep}>
            Skip ▶
          </button>
        </>
      ) : (
        <>
          <span className="audio-icon">{phase === 'playing' ? (stalled ? '⚠️' : '🔊') : '✅'}</span>
          <div className="audio-info">
            <p>
              {stalled
                ? 'Audio stalled — click retry'
                : phase === 'playing' ? 'Playing…' : 'Audio finished'}
            </p>
            <div className="audio-progress">
              <div className="audio-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
          {stalled && phase === 'playing' && (
            <button className="btn btn-secondary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem' }} onClick={retry}>
              Retry
            </button>
          )}
          {!stalled && <span className="once-note">{label}</span>}
        </>
      )}
    </div>
  )
}
