import { useState, useEffect, useRef } from 'react'
import { speak, stopSpeaking } from '../../utils/speech'
import { startRecording, stopRecording } from '../../utils/speech'
import { ItemTimerBar } from '../Timer'

const PHASES = { LISTENING: 'listening', PREP: 'prep', RECORDING: 'recording', DONE: 'done' }

export default function RetellLecture({ question, onAnswer, onNext }) {
  const [phase, setPhase] = useState(PHASES.LISTENING)
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [notes, setNotes] = useState('')
  const finalRef = useRef('')

  useEffect(() => {
    speak(question.audio, { rate: 0.88, onEnd: () => setPhase(PHASES.PREP) })
    return () => { stopSpeaking(); stopRecording() }
  }, []) // eslint-disable-line

  useEffect(() => {
    if (phase !== PHASES.RECORDING) return
    finalRef.current = ''
    startRecording({
      onInterim: t => setInterim(t),
      onFinal: t => { finalRef.current = t; setTranscript(t) },
      onEnd: t => { onAnswer(question.id, t || finalRef.current); setPhase(PHASES.DONE) },
      onError: () => {},
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

      {(phase === PHASES.LISTENING || phase === PHASES.PREP) && (
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
          <div className="recording-banner">
            <div className="recording-dot" />
            <span>Recording</span>
            <div className="waveform">{[...Array(5)].map((_, i) => <div key={i} className="waveform-bar" />)}</div>
          </div>
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
