import { useState, useCallback, useRef } from 'react'
import Timer from './Timer'
import SectionBreak from './SectionBreak'

// Speaking
import ReadAloud from './speaking/ReadAloud'
import RepeatSentence from './speaking/RepeatSentence'
import DescribeImage from './speaking/DescribeImage'
import RetellLecture from './speaking/RetellLecture'
import AnswerShortQuestion from './speaking/AnswerShortQuestion'

// Writing
import SummarizeWrittenText from './writing/SummarizeWrittenText'
import WriteEssay from './writing/WriteEssay'

// Reading
import MCQSingle from './reading/MCQSingle'
import MCQMultiple from './reading/MCQMultiple'
import ReorderParagraphs from './reading/ReorderParagraphs'
import ReadingFIB from './reading/ReadingFIB'
import ReadingWritingFIB from './reading/ReadingWritingFIB'

// Listening
import SummarizeSpokenText from './listening/SummarizeSpokenText'
import MCQMultipleListening from './listening/MCQMultipleListening'
import FillBlanksListening from './listening/FillBlanksListening'
import HighlightCorrectSummary from './listening/HighlightCorrectSummary'
import MCQSingleListening from './listening/MCQSingleListening'
import SelectMissingWord from './listening/SelectMissingWord'
import HighlightIncorrectWords from './listening/HighlightIncorrectWords'
import WriteFromDictation from './listening/WriteFromDictation'

const SECTION_LABELS = { speaking: 'Speaking', writing: 'Writing', reading: 'Reading', listening: 'Listening' }

// Section-wide timers in seconds (reading/writing share timer)
const SECTION_TIMERS = { writing: 37 * 60, reading: 38 * 60, listening: 50 * 60 }

function QuestionShell({ question, index, total, sectionTimer, onNext, onAnswer, currentAnswer }) {
  const sectionLabel = SECTION_LABELS[question.section] || ''

  const renderQuestion = () => {
    const props = { question, answer: currentAnswer, onAnswer, onNext }
    switch (question.type) {
      case 'read-aloud':              return <ReadAloud {...props} />
      case 'repeat-sentence':         return <RepeatSentence {...props} />
      case 'describe-image':          return <DescribeImage {...props} />
      case 'retell-lecture':          return <RetellLecture {...props} />
      case 'answer-short-question':   return <AnswerShortQuestion {...props} />
      case 'summarize-written-text':  return <SummarizeWrittenText {...props} />
      case 'write-essay':             return <WriteEssay {...props} />
      case 'mcq-single-reading':      return <MCQSingle {...props} />
      case 'mcq-multiple-reading':    return <MCQMultiple {...props} />
      case 'reorder-paragraphs':      return <ReorderParagraphs {...props} />
      case 'reading-fib':             return <ReadingFIB {...props} />
      case 'reading-writing-fib':     return <ReadingWritingFIB {...props} />
      case 'summarize-spoken-text':   return <SummarizeSpokenText {...props} />
      case 'mcq-multiple-listening':  return <MCQMultipleListening {...props} />
      case 'fill-blanks-listening':   return <FillBlanksListening {...props} />
      case 'highlight-correct-summary': return <HighlightCorrectSummary {...props} />
      case 'mcq-single-listening':    return <MCQSingleListening {...props} />
      case 'select-missing-word':     return <SelectMissingWord {...props} />
      case 'highlight-incorrect-words': return <HighlightIncorrectWords {...props} />
      case 'write-from-dictation':    return <WriteFromDictation {...props} />
      default: return <div style={{padding:'2rem'}}>Unknown question type: {question.type}</div>
    }
  }

  return (
    <div className="test-shell">
      <div className="test-topbar">
        <div className="topbar-left">
          <span className="topbar-logo">PTE Mock</span>
          <span className="section-pill">{sectionLabel}</span>
        </div>
        <div className="topbar-center">
          {sectionTimer != null && <Timer key={`${question.section}-timer`} seconds={sectionTimer} onExpire={onNext} />}
        </div>
        <div className="topbar-right">
          <span className="q-counter">Question {index + 1} of {total}</span>
        </div>
      </div>
      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>
      <div className="question-area">
        {renderQuestion()}
      </div>
    </div>
  )
}

export default function TestRunner({ questions, testType, onComplete }) {
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const answersRef = useRef({})

  const realQs = questions.filter(q => q.type !== 'section-break')
  const allQs = questions

  const currentQ = allQs[idx]

  const handleAnswer = useCallback((qId, value) => {
    answersRef.current = { ...answersRef.current, [qId]: value }
    setAnswers(answersRef.current)
  }, [])

  const handleNext = useCallback(() => {
    setIdx(i => {
      if (i >= allQs.length - 1) {
        onComplete(answersRef.current)
        return i
      }
      return i + 1
    })
  }, [allQs.length, onComplete])

  if (!currentQ) return null

  if (currentQ.type === 'section-break') {
    return <SectionBreak question={currentQ} onNext={handleNext} />
  }

  const section = currentQ.section
  const isSectionTimed = ['writing', 'reading', 'listening'].includes(section)
  const sectionTimer = isSectionTimed ? SECTION_TIMERS[section] : null

  const visibleIndex = allQs.slice(0, idx).filter(q => q.type !== 'section-break').length
  const visibleTotal = realQs.length

  return (
    <QuestionShell
      key={currentQ.id}
      question={currentQ}
      index={visibleIndex}
      total={visibleTotal}
      sectionTimer={sectionTimer}
      onNext={handleNext}
      onAnswer={handleAnswer}
      currentAnswer={answers[currentQ.id]}
    />
  )
}
