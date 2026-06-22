import { useState, useEffect, useRef } from 'react'
import { checkSupport } from '../utils/speech'

const TEST_PHRASE = 'The quick brown fox jumps over the lazy dog.'

export default function MicCheck({ onContinue, onBack }) {
  const [status, setStatus] = useState('idle') // idle | requesting | ready | denied | unsupported
  const [errorMsg, setErrorMsg] = useState('')
  const [level, setLevel] = useState(0)
  const [peakLevel, setPeakLevel] = useState(0)
  const streamRef = useRef(null)
  const ctxRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    const sup = checkSupport()
    if (!sup.getUserMedia || !sup.mediaRecorder) {
      setStatus('unsupported')
      setErrorMsg('Your browser does not support audio recording. Please use Chrome, Edge, or Firefox.')
      return
    }
    requestMic()
    return cleanup
  }, [])

  function cleanup() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    if (ctxRef.current) { try { ctxRef.current.close() } catch {} }
    streamRef.current = null
    ctxRef.current = null
  }

  async function requestMic() {
    setStatus('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      })
      streamRef.current = stream
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      ctxRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      source.connect(analyser)
      const buf = new Uint8Array(analyser.frequencyBinCount)
      let peak = 0
      let lastEmit = 0
      const tick = () => {
        analyser.getByteTimeDomainData(buf)
        let p = 0
        for (let i = 0; i < buf.length; i++) {
          const v = Math.abs(buf[i] - 128) / 128
          if (v > p) p = v
        }
        if (p > peak) { peak = p; setPeakLevel(peak) }
        const now = performance.now()
        if (now - lastEmit >= 80) { lastEmit = now; setLevel(p) }
        rafRef.current = requestAnimationFrame(tick)
      }
      tick()
      setStatus('ready')
    } catch (e) {
      setStatus('denied')
      setErrorMsg(e?.message || 'Microphone access was blocked.')
    }
  }

  const detectedSpeech = peakLevel >= 0.12

  return (
    <div className="mic-check-screen">
      <div className="mic-check-card">
        <h1 className="mic-check-title">Microphone Check</h1>
        <p className="mic-check-sub">
          Before the test starts, let's confirm your microphone is working. This is the same check used during the real PTE.
        </p>

        {status === 'requesting' && (
          <div className="mic-check-status">Requesting microphone access…</div>
        )}

        {(status === 'denied' || status === 'unsupported') && (
          <div className="mic-check-error">
            <strong>⚠️ {status === 'denied' ? 'Microphone blocked' : 'Browser unsupported'}</strong>
            <p>{errorMsg}</p>
            {status === 'denied' && (
              <button className="btn btn-primary" onClick={requestMic}>Try again</button>
            )}
          </div>
        )}

        {status === 'ready' && (
          <>
            <div className="mic-check-instructions">
              <p>Speak this sentence in a normal voice:</p>
              <blockquote className="mic-check-phrase">"{TEST_PHRASE}"</blockquote>
            </div>

            <div className="mic-meter-wrap">
              <div className="mic-meter-label">
                <span>Live input level</span>
                <span className={detectedSpeech ? 'meter-ok' : 'meter-low'}>
                  {detectedSpeech ? '✓ Detected' : 'Waiting for speech…'}
                </span>
              </div>
              <div className="mic-meter-track">
                <div className="mic-meter-fill" style={{ width: `${Math.min(100, level * 200)}%` }} />
                <div className="mic-meter-peak" style={{ left: `${Math.min(100, peakLevel * 200)}%` }} />
                <div className="mic-meter-threshold" />
              </div>
              <p className="mic-meter-hint">
                The bar should reach the green zone when you speak. If it stays flat, check that the right microphone is selected in your system settings.
              </p>
            </div>

            <div className="mic-check-actions">
              <button className="btn btn-secondary" onClick={onBack}>← Back</button>
              <button
                className="btn btn-primary"
                onClick={() => { cleanup(); onContinue() }}
                disabled={!detectedSpeech}
                title={detectedSpeech ? '' : 'Speak the test phrase first'}
              >
                {detectedSpeech ? 'Mic working — Start test →' : 'Speak to continue'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
