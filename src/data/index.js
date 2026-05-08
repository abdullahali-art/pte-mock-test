import { readAloudItems, repeatSentenceItems, describeImageItems, retellLectureItems, answerShortQuestionItems } from './speaking.js'
import { summarizeWrittenTextItems, writeEssayItems } from './writing.js'
import { readingMCQSingleItems, readingMCQMultipleItems, reorderParagraphsItems, readingFIBItems, readingWritingFIBItems } from './reading.js'
import { summarizeSpokenTextItems, listeningMCQMultipleItems, fillBlanksListeningItems, highlightCorrectSummaryItems, listeningMCQSingleItems, selectMissingWordItems, highlightIncorrectWordsItems, writeFromDictationItems } from './listening.js'

// ─── localStorage-backed deduplication ───────────────────────────────────────
function getUsed(key) {
  try { return new Set(JSON.parse(localStorage.getItem(`pte_used_${key}`) || '[]')) }
  catch { return new Set() }
}
function saveUsed(key, set) {
  localStorage.setItem(`pte_used_${key}`, JSON.stringify([...set]))
}
function pickN(pool, key, n) {
  let used = getUsed(key)
  // Reset when pool nearly exhausted
  const available = pool.filter(q => !used.has(q.id))
  if (available.length < n) {
    used = new Set()
    saveUsed(key, used)
  }
  const fresh = pool.filter(q => !used.has(q.id))
  const shuffled = [...fresh].sort(() => Math.random() - 0.5)
  const picked = shuffled.slice(0, n)
  picked.forEach(q => used.add(q.id))
  saveUsed(key, used)
  return picked
}

// ─── Section break markers ────────────────────────────────────────────────────
const writingBreak = { id: 'break-writing', type: 'section-break', section: 'writing', title: 'Writing', icon: '✍️', duration: '~37 mins', rules: ['Two tasks: Summarize Written Text and Write Essay', 'Summarize Written Text: one sentence, 5–75 words (10 min each)', 'Write Essay: 200–300 words (20 min)', 'No going back to previous questions'] }
const readingBreak = { id: 'break-reading', type: 'section-break', section: 'reading', title: 'Reading', icon: '📖', duration: '~32–41 mins', rules: ['One shared timer for the whole section', 'Question types: MCQ, Reorder, Fill in the Blanks', 'MCQ Multiple Answers: negative marking applies', 'Manage time carefully — you cannot go back'] }
const listeningBreak = { id: 'break-listening', type: 'section-break', section: 'listening', title: 'Listening', icon: '🎧', duration: '~45–57 mins', rules: ['Audio plays ONCE only — no replay', 'Take notes while audio is playing', 'Highlight Incorrect Words: negative marking applies', 'MCQ Multiple Answers: negative marking applies'] }

// ─── Full Test ────────────────────────────────────────────────────────────────
export function buildFullTest() {
  const speaking = [
    ...pickN(readAloudItems,           'ra',  6),
    ...pickN(repeatSentenceItems,      'rs',  10),
    ...pickN(describeImageItems,       'di',  6),
    ...pickN(retellLectureItems,       'rl',  3),
    ...pickN(answerShortQuestionItems, 'asq', 5),
  ]
  const writing = [
    writingBreak,
    ...pickN(summarizeWrittenTextItems, 'swt', 2),
    ...pickN(writeEssayItems,           'we',  1),
  ]
  const reading = [
    readingBreak,
    ...pickN(readingMCQSingleItems,    'rms',   2),
    ...pickN(readingMCQMultipleItems,  'rmm',   2),
    ...pickN(reorderParagraphsItems,   'rop',   2),
    ...pickN(readingFIBItems,          'rfib',  4),
    ...pickN(readingWritingFIBItems,   'rwfib', 5),
  ]
  const listening = [
    listeningBreak,
    ...pickN(summarizeSpokenTextItems,     'sst',  2),
    ...pickN(listeningMCQMultipleItems,    'lmm',  2),
    ...pickN(fillBlanksListeningItems,     'lfib', 3),
    ...pickN(highlightCorrectSummaryItems, 'hcs',  2),
    ...pickN(listeningMCQSingleItems,      'lms',  2),
    ...pickN(selectMissingWordItems,       'smw',  1),
    ...pickN(highlightIncorrectWordsItems, 'hiw',  2),
    ...pickN(writeFromDictationItems,      'wfd',  4),
  ]
  return [...speaking, ...writing, ...reading, ...listening]
}

// ─── Short Test (~30 min) ─────────────────────────────────────────────────────
export function buildShortTest() {
  const speaking = [
    ...pickN(readAloudItems,           'ra',  3),
    ...pickN(repeatSentenceItems,      'rs',  4),
    ...pickN(describeImageItems,       'di',  2),
    ...pickN(retellLectureItems,       'rl',  1),
    ...pickN(answerShortQuestionItems, 'asq', 2),
  ]
  const writing = [
    writingBreak,
    ...pickN(summarizeWrittenTextItems, 'swt', 1),
    ...pickN(writeEssayItems,           'we',  1),
  ]
  const reading = [
    readingBreak,
    ...pickN(readingMCQSingleItems,    'rms',   1),
    ...pickN(readingMCQMultipleItems,  'rmm',   1),
    ...pickN(reorderParagraphsItems,   'rop',   1),
    ...pickN(readingFIBItems,          'rfib',  2),
    ...pickN(readingWritingFIBItems,   'rwfib', 2),
  ]
  const listening = [
    listeningBreak,
    ...pickN(summarizeSpokenTextItems,     'sst',  1),
    ...pickN(listeningMCQMultipleItems,    'lmm',  1),
    ...pickN(fillBlanksListeningItems,     'lfib', 2),
    ...pickN(highlightCorrectSummaryItems, 'hcs',  1),
    ...pickN(listeningMCQSingleItems,      'lms',  1),
    ...pickN(selectMissingWordItems,       'smw',  1),
    ...pickN(highlightIncorrectWordsItems, 'hiw',  1),
    ...pickN(writeFromDictationItems,      'wfd',  2),
  ]
  return [...speaking, ...writing, ...reading, ...listening]
}
