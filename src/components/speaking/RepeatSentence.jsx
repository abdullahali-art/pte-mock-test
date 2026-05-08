import { useState, useEffect, useRef } from 'react'
import { speak, stopSpeaking } from '../../utils/speech'
import { startRecording, stopRecording } from '../../utils/speech'
import { ItemTimerBar } from '../Timer'

const PHASES = { LISTENING: 'listening', RECORDING: 'recording', DONE: 'done' }

export default function RepeatSentence({ question, onAnswer, onNext }) {
  const [phase, setPhase] = useState(PHASES.LISTENING)
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const finalRef = useRef('')

  useEffect(() => {
    speak(question.audio, { rate: 0.88, onEnd: () => setPhase(PHASES.RECORDING) })
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
        <div className="q-type-label">Repeat Sentence</div>
        <p className="q-instruction">You will hear a sentence. Repeat it exactly as you hear it. You will hear it only once.</p>
      </div>

      <div className="q-card" style={{ textAlign: 'center', padding: '2rem' }}>
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
          <div className="recording-banner">
            <div className="recording-dot" />
            <span>Recording</span>
            <div className="waveform">{[...Array(5)].map((_, i) => <div key={i} className="waveform-bar" />)}</div>
          </div>
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
