import { useState, useEffect, useRef } from 'react'
import { startRecording, stopRecording } from '../../utils/speech'
import { ItemTimerBar } from '../Timer'

const PHASES = { PREP: 'prep', RECORDING: 'recording', DONE: 'done' }

function BarChart({ data }) {
  const max = Math.max(...data.values)
  return (
    <svg viewBox={`0 0 ${data.labels.length * 70 + 60} 240`} style={{ width: '100%', maxHeight: 260 }}>
      {data.values.map((v, i) => {
        const barH = (v / max) * 160
        const x = 40 + i * 70
        const y = 180 - barH
        return (
          <g key={i}>
            <rect x={x} y={y} width={48} height={barH} fill={data.color || '#1a56db'} rx={4} />
            <text x={x + 24} y={y - 6} textAnchor="middle" fontSize={11} fill="#374151">{v}{data.unit || ''}</text>
            <text x={x + 24} y={200} textAnchor="middle" fontSize={10} fill="#6b7280">{data.labels[i]}</text>
          </g>
        )
      })}
      <line x1={38} y1={20} x2={38} y2={182} stroke="#d1d5db" strokeWidth={1.5} />
      <line x1={38} y1={182} x2={data.labels.length * 70 + 50} y2={182} stroke="#d1d5db" strokeWidth={1.5} />
    </svg>
  )
}

function LineChart({ data }) {
  const max = Math.max(...data.values)
  const min = Math.min(...data.values)
  const w = data.labels.length > 6 ? data.labels.length * 60 + 60 : 500
  const pts = data.values.map((v, i) => {
    const x = 40 + (i / (data.labels.length - 1)) * (w - 80)
    const y = 180 - ((v - min) / (max - min || 1)) * 150
    return `${x},${y}`
  }).join(' ')
  return (
    <svg viewBox={`0 0 ${w} 220`} style={{ width: '100%', maxHeight: 220 }}>
      <polyline points={pts} fill="none" stroke={data.color || '#1a56db'} strokeWidth={2.5} />
      {data.values.map((v, i) => {
        const x = 40 + (i / (data.labels.length - 1)) * (w - 80)
        const y = 180 - ((v - min) / (max - min || 1)) * 150
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={4} fill={data.color || '#1a56db'} />
            <text x={x} y={y - 10} textAnchor="middle" fontSize={10} fill="#374151">{v}{data.unit || ''}</text>
            <text x={x} y={200} textAnchor="middle" fontSize={9} fill="#6b7280">{data.labels[i]}</text>
          </g>
        )
      })}
      <line x1={38} y1={20} x2={38} y2={182} stroke="#d1d5db" strokeWidth={1.5} />
      <line x1={38} y1={182} x2={w - 20} y2={182} stroke="#d1d5db" strokeWidth={1.5} />
    </svg>
  )
}

function PieChart({ data }) {
  const total = data.slices.reduce((s, sl) => s + sl.value, 0)
  let startAngle = -90
  const cx = 110, cy = 110, r = 90
  const slices = data.slices.map(sl => {
    const angle = (sl.value / total) * 360
    const start = startAngle
    startAngle += angle
    const rad = (a) => (a * Math.PI) / 180
    const x1 = cx + r * Math.cos(rad(start))
    const y1 = cy + r * Math.sin(rad(start))
    const x2 = cx + r * Math.cos(rad(start + angle))
    const y2 = cy + r * Math.sin(rad(start + angle))
    const large = angle > 180 ? 1 : 0
    const midAngle = start + angle / 2
    const lx = cx + (r * 0.65) * Math.cos(rad(midAngle))
    const ly = cy + (r * 0.65) * Math.sin(rad(midAngle))
    return { ...sl, path: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`, lx, ly }
  })
  return (
    <svg viewBox="0 0 380 220" style={{ width: '100%', maxHeight: 220 }}>
      {slices.map((sl, i) => (
        <g key={i}>
          <path d={sl.path} fill={sl.color} />
          <text x={sl.lx} y={sl.ly} textAnchor="middle" fontSize={11} fill="#fff" fontWeight={600}>{sl.value}%</text>
        </g>
      ))}
      {slices.map((sl, i) => (
        <g key={i}>
          <rect x={240} y={20 + i * 28} width={14} height={14} fill={sl.color} rx={2} />
          <text x={260} y={32 + i * 28} fontSize={12} fill="#374151">{sl.label} ({sl.value}%)</text>
        </g>
      ))}
    </svg>
  )
}

function ChartRenderer({ question }) {
  const { imageType, chartData, title } = question
  return (
    <div className="image-desc-card" style={{ flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ fontWeight: 600, color: 'var(--text)', textAlign: 'center', fontSize: '0.95rem' }}>{title}</p>
      {imageType === 'bar-chart' && <BarChart data={chartData} />}
      {imageType === 'line-chart' && <LineChart data={chartData} />}
      {imageType === 'pie-chart' && <PieChart data={chartData} />}
      {chartData.note && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>{chartData.note}</p>}
    </div>
  )
}

export default function DescribeImage({ question, onAnswer, onNext }) {
  const [phase, setPhase] = useState(PHASES.PREP)
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const finalRef = useRef('')

  function startRecordingPhase() { setPhase(PHASES.RECORDING) }

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
        <div className="q-type-label">Describe Image</div>
        <p className="q-instruction">Look at the image below. In 25 seconds you must describe the image in detail. You will have 40 seconds to give your response.</p>
      </div>

      <ChartRenderer question={question} />

      {phase === PHASES.PREP && (
        <>
          <div className="prep-banner"><span>👁️</span><span>Study the image carefully before recording begins.</span></div>
          <ItemTimerBar seconds={question.prepTime} running={true} onExpire={startRecordingPhase} />
          <button className="btn btn-primary" onClick={startRecordingPhase}>Start Recording Now</button>
        </>
      )}

      {phase === PHASES.RECORDING && (
        <>
          <div className="recording-banner">
            <div className="recording-dot" />
            <span>Recording — describe the image now.</span>
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
