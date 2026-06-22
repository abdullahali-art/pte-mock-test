import { useEffect, useRef, useState } from 'react'

export default function Timer({ seconds, onExpire, paused = false }) {
  const [remaining, setRemaining] = useState(seconds)
  const ref = useRef(null)
  // Hold latest onExpire in a ref so re-renders that change the callback
  // identity don't restart the interval and freeze the countdown.
  const onExpireRef = useRef(onExpire)
  useEffect(() => { onExpireRef.current = onExpire }, [onExpire])

  useEffect(() => { setRemaining(seconds) }, [seconds])

  useEffect(() => {
    if (paused) { clearInterval(ref.current); return }
    ref.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(ref.current); onExpireRef.current?.(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(ref.current)
  }, [paused, seconds])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const label = `${mins}:${String(secs).padStart(2, '0')}`
  const pct = seconds > 0 ? remaining / seconds : 0
  const cls = pct < 0.15 ? 'danger' : pct < 0.33 ? 'warning' : 'normal'

  return (
    <div className={`timer-display ${cls}`}>
      <span className="timer-icon">⏱</span>
      {label}
    </div>
  )
}

// Item-level countdown bar used inside speaking tasks
export function ItemTimerBar({ seconds, running, onExpire }) {
  const [remaining, setRemaining] = useState(seconds)
  const ref = useRef(null)
  const onExpireRef = useRef(onExpire)
  useEffect(() => { onExpireRef.current = onExpire }, [onExpire])

  useEffect(() => { setRemaining(seconds) }, [seconds])

  useEffect(() => {
    if (!running) { clearInterval(ref.current); return }
    ref.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(ref.current); onExpireRef.current?.(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(ref.current)
  }, [running, seconds])

  const pct = seconds > 0 ? (remaining / seconds) * 100 : 0
  const color = pct < 15 ? 'var(--danger)' : pct < 33 ? 'var(--warning)' : 'var(--primary)'

  return (
    <div>
      <div className="item-timer-bar">
        <div className="item-timer-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem', textAlign: 'right' }}>
        {remaining}s remaining
      </p>
    </div>
  )
}
