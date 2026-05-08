// ─── Score objective questions locally (no AI needed) ──────────────────────────

// MCQ Single: 1 correct / 0 wrong
export function scoreMCQSingle(answer, correct) {
  if (!answer) return { score: 0, max: 1 }
  return { score: answer === correct ? 1 : 0, max: 1 }
}

// MCQ Multiple: partial credit with negative marking (min 0)
export function scoreMCQMultiple(selected, correct) {
  const sel = Array.isArray(selected) ? selected : []
  const cor = Array.isArray(correct) ? correct : []
  let score = 0
  sel.forEach(s => { if (cor.includes(s)) score++; else score-- })
  return { score: Math.max(0, score), max: cor.length }
}

// Reorder Paragraphs: score adjacent pairs
export function scoreReorder(ordered, correctOrder) {
  if (!ordered || ordered.length === 0) return { score: 0, max: Math.max(0, correctOrder.length - 1) }
  let score = 0
  const max = correctOrder.length - 1
  for (let i = 0; i < correctOrder.length - 1; i++) {
    const aIdx = ordered.indexOf(correctOrder[i])
    const bIdx = ordered.indexOf(correctOrder[i + 1])
    if (aIdx !== -1 && bIdx !== -1 && aIdx + 1 === bIdx) score++
  }
  return { score, max }
}

// Reading FIB: 1 per correct blank
export function scoreReadingFIB(answers, blanks) {
  let score = 0
  blanks.forEach(b => {
    const ans = (answers[b.id] || '').trim().toLowerCase()
    if (ans === b.answer.toLowerCase()) score++
  })
  return { score, max: blanks.length }
}

// Reading-Writing FIB: 1 per correct blank
export function scoreReadingWritingFIB(answers, blanks) {
  return scoreReadingFIB(answers, blanks)
}

// Highlight Correct Summary: 1 correct / 0 wrong
export function scoreHighlightCorrectSummary(answer, correct) {
  return { score: answer === correct ? 1 : 0, max: 1 }
}

// Select Missing Word: 1 correct / 0 wrong
export function scoreSelectMissingWord(answer, correct) {
  return { score: answer === correct ? 1 : 0, max: 1 }
}

// Highlight Incorrect Words: partial + negative marking
export function scoreHighlightIncorrectWords(selected, transcript) {
  const incorrect = transcript.filter(w => !w.correct).map(w => w.word)
  const sel = Array.isArray(selected) ? selected : []
  let score = 0
  sel.forEach(s => { if (incorrect.includes(s)) score++; else score-- })
  return { score: Math.max(0, score), max: incorrect.length }
}

// Fill Blanks Listening: 1 per correct word
export function scoreFillBlanksListening(answers, blanks) {
  let score = 0
  blanks.forEach((b, i) => {
    const ans = (answers[i] || '').trim().toLowerCase()
    if (ans === b.word.toLowerCase()) score++
  })
  return { score, max: blanks.length }
}

// Write from Dictation: 1 per correctly spelled word
export function scoreWriteFromDictation(response, audio) {
  const normalize = s => s.toLowerCase().replace(/[^a-z0-9'\s]/g, '').trim().split(/\s+/)
  const expected = normalize(audio)
  const given = normalize(response || '')
  let score = 0
  expected.forEach((word, i) => { if (given[i] === word) score++ })
  return { score, max: expected.length }
}

// ─── Aggregate section scores → 10–90 PTE scale ──────────────────────────────
export function computeSectionScore(rawScore, rawMax) {
  if (!rawMax) return 36
  const pct = rawScore / rawMax
  // Map 0–100% to 10–90 range
  return Math.round(10 + pct * 80)
}

export function computeOverallScore(sectionScores) {
  const vals = Object.values(sectionScores).filter(v => typeof v === 'number')
  if (!vals.length) return 36
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
}

// ─── Score all objective answers in one pass ──────────────────────────────────
export function scoreAllObjective(questions, answers) {
  const sectionRaw = { speaking: { score: 0, max: 0 }, writing: { score: 0, max: 0 }, reading: { score: 0, max: 0 }, listening: { score: 0, max: 0 } }

  questions.forEach(q => {
    const ans = answers[q.id]
    const sec = q.section
    if (!sectionRaw[sec]) return
    let result = { score: 0, max: 0 }

    switch (q.type) {
      case 'mcq-single-reading':
      case 'mcq-single-listening':
        result = scoreMCQSingle(ans, q.correct); break
      case 'mcq-multiple-reading':
      case 'mcq-multiple-listening':
        result = scoreMCQMultiple(ans, q.correct); break
      case 'reorder-paragraphs': {
        const ordered = ans?.map(id => id) || []
        result = scoreReorder(ordered, q.correctOrder); break
      }
      case 'reading-fib':
        result = scoreReadingFIB(ans || {}, q.blanks); break
      case 'reading-writing-fib':
        result = scoreReadingWritingFIB(ans || {}, q.blanks); break
      case 'highlight-correct-summary':
        result = scoreHighlightCorrectSummary(ans, q.correct); break
      case 'select-missing-word':
        result = scoreSelectMissingWord(ans, q.correct); break
      case 'highlight-incorrect-words':
        result = scoreHighlightIncorrectWords(ans, q.transcript); break
      case 'fill-blanks-listening':
        result = scoreFillBlanksListening(ans || [], q.blanks); break
      case 'write-from-dictation':
        result = scoreWriteFromDictation(ans, q.audio); break
      default:
        return
    }
    sectionRaw[sec].score += result.score
    sectionRaw[sec].max += result.max
  })

  const sectionScores = {}
  Object.entries(sectionRaw).forEach(([sec, { score, max }]) => {
    sectionScores[sec] = computeSectionScore(score, max)
  })
  sectionScores.overall = computeOverallScore(sectionScores)
  return sectionScores
}
