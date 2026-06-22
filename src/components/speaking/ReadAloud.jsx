import { useState, useEffect, useRef } from 'react'
import { startRecording, stopRecording } from '../../utils/speech'
import { ItemTimerBar } from '../Timer'
import Waveform from './Waveform'

const PHASES = { PREP: 'prep', RECORDING: 'recording', DONE: 'done' }

export default function ReadAloud({ question, onAnswer, onNext }) {
  const [phase, setPhase] = useState(PHASES.PREP)
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [level, setLevel] = useState(0)
  const [micError, setMicError] = useState('')
  const finalRef = useRef('')

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
      },
      onError: e => setMicError(e),
    })
    return () => { stopRecording() }
  }, [phase]) // eslint-disable-line

  function startRecordingPhase() { setPhase(PHASES.RECORDING) }
  function finish() {
    stopRecording()
    onAnswer(question.id, finalRef.current || transcript)
    setPhase(PHASES.DONE)
  }

  return (
    <div className="speaking-layout">
      <div className="q-header">
        <div className="q-type-label">Read Aloud</div>
        <p className="q-instruction">Look at the text below. In 40 seconds you must read this text aloud as naturally and clearly as possible.</p>
      </div>

      <div className="q-card">
        <p className="q-passage">{question.passage}</p>
      </div>

      {phase === PHASES.PREP && (
        <>
          <div className="prep-banner">
            <span>📖</span>
            <span>Preparation time — read through the passage carefully.</span>
          </div>
          <ItemTimerBar seconds={question.prepTime} running={true} onExpire={startRecordingPhase} />
          <button className="btn btn-primary" onClick={startRecordingPhase}>Start Recording Now</button>
        </>
      )}

      {phase === PHASES.RECORDING && (
        <>
          {micError ? (
            <div className="recording-banner" style={{ background: '#fee2e2', color: '#b91c1c' }}>
              <span>⚠️</span>
              <span>{micError}</span>
            </div>
          ) : (
            <div className="recording-banner">
              <div className="recording-dot" />
              <span>Recording — read the passage aloud now.</span>
              <Waveform level={level} />
            </div>
          )}
          <ItemTimerBar seconds={question.speakTime} running={true} onExpire={finish} />
          <div className={`transcript-box ${interim ? 'has-text' : ''}`}>
            {interim || 'Listening to you speak…'}
          </div>
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
