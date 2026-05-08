import { useState } from 'react'

export default function ReorderParagraphs({ question, onAnswer, onNext }) {
  const [source, setSource] = useState([...question.paragraphs])
  const [ordered, setOrdered] = useState([])
  const [dragging, setDragging] = useState(null)
  const [dragFrom, setDragFrom] = useState(null) // 'source' | 'ordered'

  function startDrag(item, from) { setDragging(item); setDragFrom(from) }

  function dropToOrdered(e) {
    e.preventDefault()
    if (!dragging) return
    if (dragFrom === 'source') {
      setSource(s => s.filter(p => p.id !== dragging.id))
      setOrdered(o => { const n = [...o, dragging]; onAnswer(question.id, n.map(p => p.id)); return n })
    }
    setDragging(null)
  }

  function dropToSource(e) {
    e.preventDefault()
    if (!dragging || dragFrom !== 'ordered') return
    setOrdered(o => { const n = o.filter(p => p.id !== dragging.id); onAnswer(question.id, n.map(p => p.id)); return n })
    setSource(s => [...s, dragging])
    setDragging(null)
  }

  function clickMove(item, from) {
    if (from === 'source') {
      setSource(s => s.filter(p => p.id !== item.id))
      setOrdered(o => { const n = [...o, item]; onAnswer(question.id, n.map(p => p.id)); return n })
    } else {
      setOrdered(o => { const n = o.filter(p => p.id !== item.id); onAnswer(question.id, n.map(p => p.id)); return n })
      setSource(s => [...s, item])
    }
  }

  return (
    <div className="reading-layout">
      <div className="q-header">
        <div className="q-type-label">Re-order Paragraphs</div>
        <p className="q-instruction">The paragraphs below are in the wrong order. Click or drag them into the correct order in the right column.</p>
      </div>
      <div className="reorder-layout">
        <div className="reorder-col">
          <h4>Source (click to move →)</h4>
          <div onDragOver={e => e.preventDefault()} onDrop={dropToSource}>
            {source.length === 0 && <div className="reorder-drop-zone">All moved</div>}
            {source.map(p => (
              <div key={p.id} className="reorder-item"
                draggable onDragStart={() => startDrag(p, 'source')}
                onClick={() => clickMove(p, 'source')}>
                {p.text}
              </div>
            ))}
          </div>
        </div>
        <div className="reorder-col">
          <h4>Answer (correct order ↓)</h4>
          <div onDragOver={e => e.preventDefault()} onDrop={dropToOrdered}
            style={{ minHeight: 80, border: ordered.length === 0 ? '2px dashed var(--border)' : 'none', borderRadius: 6, padding: ordered.length === 0 ? '1rem' : 0 }}>
            {ordered.length === 0 && <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Click or drag paragraphs here</span>}
            {ordered.map((p, i) => (
              <div key={p.id} className="reorder-item"
                draggable onDragStart={() => startDrag(p, 'ordered')}
                onClick={() => clickMove(p, 'ordered')}>
                <strong style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>{i + 1}.</strong>{p.text}
              </div>
            ))}
          </div>
        </div>
      </div>
      <button className="btn btn-primary" onClick={onNext}>Next →</button>
    </div>
  )
}
