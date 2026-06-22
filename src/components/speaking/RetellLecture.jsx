import { useState, useEffect, useRef } from 'react'
import { speak, stopSpeaking, startRecording, stopRecording } from '../../utils/speech'
import { ItemTimerBar } from '../Timer'
import Waveform from './Waveform'

const PHASES = { READY: 'ready', LISTENING: 'listening', PREP: 'prep', RECORDING: 'recording', DONE: 'done' }
const READY_SECONDS = 5

export default function RetellLecture({ question, onAnswer, onNext }) {
  const [phase, setPhase] = useState(PHASES.READY)
  const [readyCountdown, setReadyCountdown] = useState(READY_SECONDS)
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [notes, setNotes] = useState('')
  const [level, setLevel] = useState(0)
  const [micError, setMicError] = useState('')
  const finalRef = useRef('')

  useEffect(() => {
    if (phase !== PHASES.READY) return
    if (readyCountdown <= 0) { setPhase(PHASES.LISTENING); return }
    const t = setTimeout(() => setReadyCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, readyCountdown])

  useEffect(() => {
    if (phase !== PHASES.LISTENING) return
    speak(question.audio, { rate: 0.88, onEnd: () => setPhase(PHASES.PREP) })
    return () => { stopSpeaking(); stopRecording() }
  }, [phase]) // eslint-disable-line

  useEffect(() => {
    if (phase !== PHASES.RECORDING) return
    finalRef.current = ''
    startRecording({
      onInterim: t => setInterim(t),
      onFinal: t => { finalRef.current = t; setTranscript(t) },
      onLevel: setLevel,
      onEnd: ({ transcript: t }) => {
        const val = (t || finalRef.current || '').trim()
        setTranscript(val)
        onAnswer(question.id, val)
        setPhase(PHASES.DONE)
      },
      onError: e => setMicError(e),
    })
    return () => stopRecording()
  }, [phase]) // eslint-disable-line

  function finish() {
    stopRecording()
    onAnswer(question.id, finalRef.current || transcript)
    setPhase(PHASES.DONE)
  }

  return (
    <div className="speaking-layout">
      <div className="q-header">
        <div className="q-type-label">Re-tell Lecture</div>
        <p className="q-instruction">You will hear a short lecture. After listening, re-tell what you heard in your own words. You have 10 seconds to prepare, then 40 seconds to speak.</p>
      </div>

      <div className="q-card" style={{ textAlign: 'center', padding: '2rem' }}>
        {phase === PHASES.READY && (
          <>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⏳</div>
            <p style={{ fontWeight: 600 }}>{question.title}</p>
            <p style={{ color: 'var(--text-muted)' }}>Lecture begins in {readyCountdown} second{readyCountdown === 1 ? '' : 's'} — read the instructions now.</p>
          </>
        )}
        {phase === PHASES.LISTENING && (
          <>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎧</div>
            <p style={{ fontWeight: 600 }}>{question.title}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Listening to lecture — take notes below…</p>
          </>
        )}
        {phase === PHASES.PREP && (
          <>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
            <p style={{ color: 'var(--warning)', fontWeight: 600 }}>Prepare to retell — recording starts soon</p>
          </>
        )}
        {phase === PHASES.RECORDING && (
          <>
            <div style={{ fontSize: '2rem' }}>🎙️</div>
            <p style={{ color: 'var(--danger)', fontWeight: 600 }}>Retell the lecture now</p>
          </>
        )}
        {phase === PHASES.DONE && <p style={{ color: 'var(--success)' }}>Response recorded</p>}
      </div>

      {(phase === PHASES.READY || phase === PHASES.LISTENING || phase === PHASES.PREP) && (
        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '0.4rem' }}>Notes (optional)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Jot down key points…" rows={4} />
        </div>
      )}

      {phase === PHASES.PREP && (
        <>
          <ItemTimerBar seconds={question.prepTime} running={true} onExpire={() => setPhase(PHASES.RECORDING)} />
          <button className="btn btn-primary" onClick={() => setPhase(PHASES.RECORDING)}>Start Recording Now</button>
        </>
      )}

      {phase === PHASES.RECORDING && (
        <>
          {micError ? (
            <div className="recording-banner" style={{ background: '#fee2e2', color: '#b91c1c' }}>
              <span>⚠️</span><span>{micError}</span>
            </div>
          ) : (
            <div className="recording-banner">
              <div className="recording-dot" />
              <span>Recording</span>
              <Waveform level={level} />
            </div>
          )}
          <ItemTimerBar seconds={question.speakTime} running={true} onExpire={finish} />
          <div className={`transcript-box ${interim ? 'has-text' : ''}`}>{interim || 'Listening…'}</div>
          <button className="btn btn-secondary" onClick={finish}>Stop Recording</button>
        </>
      )}

      {phase === PHASES.DONE && (
        <>
          <div className="transcript-box has-text">{transcript || '(no speech detected)'}</div>
          <button className="btn btn-primary" onClick={onNext}>Next →</button>
        </>
      )}
    </div>
  )
}
