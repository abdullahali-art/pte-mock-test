import { useState, useEffect, useRef } from 'react'
import { speak, stopSpeaking, startRecording, stopRecording } from '../../utils/speech'
import { ItemTimerBar } from '../Timer'
import Waveform from './Waveform'

const PHASES = { PREP: 'prep', LISTENING: 'listening', RECORDING: 'recording', DONE: 'done' }
const PREP_SECONDS = 3

export default function RepeatSentence({ question, onAnswer, onNext }) {
  const [phase, setPhase] = useState(PHASES.PREP)
  const [countdown, setCountdown] = useState(PREP_SECONDS)
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [level, setLevel] = useState(0)
  const [micError, setMicError] = useState('')
  const finalRef = useRef('')

  useEffect(() => {
    if (phase !== PHASES.PREP) return
    if (countdown <= 0) { setPhase(PHASES.LISTENING); return }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, countdown])

  useEffect(() => {
    if (phase !== PHASES.LISTENING) return
    speak(question.audio, { rate: 0.88, onEnd: () => setPhase(PHASES.RECORDING) })
    return () => { stopSpeaking() }
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
        <div className="q-type-label">Repeat Sentence</div>
        <p className="q-instruction">You will hear a sentence. Repeat it exactly as you hear it. You will hear it only once.</p>
      </div>

      <div className="q-card" style={{ textAlign: 'center', padding: '2rem' }}>
        {phase === PHASES.PREP && (
          <>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
            <p style={{ color: 'var(--text-muted)' }}>Audio begins in {countdown} second{countdown === 1 ? '' : 's'}…</p>
          </>
        )}
        {phase === PHASES.LISTENING && (
          <>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔊</div>
            <p style={{ color: 'var(--text-muted)' }}>Listen carefully…</p>
          </>
        )}
        {phase === PHASES.RECORDING && (
          <>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎙️</div>
            <p style={{ color: 'var(--danger)', fontWeight: 600 }}>Repeat the sentence now</p>
          </>
        )}
        {phase === PHASES.DONE && (
          <p style={{ color: 'var(--success)', fontWeight: 600 }}>Response recorded</p>
        )}
      </div>

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
          <button className="btn btn-secondary" onClick={finish}>Done</button>
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
