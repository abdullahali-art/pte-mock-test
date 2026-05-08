import { useState, useCallback } from 'react'
import HomeScreen from './components/HomeScreen'
import ApiKeySetup from './components/ApiKeySetup'
import TestRunner from './components/TestRunner'
import ResultsScreen from './components/ResultsScreen'
import { buildFullTest, buildShortTest } from './data/index.js'

export default function App() {
  const [screen, setScreen] = useState('home') // 'home' | 'setup' | 'test' | 'results'
  const [testType, setTestType] = useState('full')
  const [apiKey, setApiKey] = useState(() => {
    const stored = localStorage.getItem('gemini_api_key')
    const envKey = import.meta.env.VITE_GEMINI_API_KEY || ''
    const key = stored || envKey
    if (key) localStorage.setItem('gemini_api_key', key)
    return key
  })
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [results, setResults] = useState(null)

  const handleStart = useCallback((type) => {
    setTestType(type)
    if (!apiKey) {
      setScreen('setup')
    } else {
      const qs = type === 'full' ? buildFullTest() : buildShortTest()
      setQuestions(qs)
      setAnswers({})
      setResults(null)
      setScreen('test')
    }
  }, [apiKey])

  const handleApiKeySaved = useCallback((key) => {
    setApiKey(key)
    localStorage.setItem('gemini_api_key', key)
    const qs = testType === 'full' ? buildFullTest() : buildShortTest()
    setQuestions(qs)
    setAnswers({})
    setResults(null)
    setScreen('test')
  }, [testType])

  const handleTestComplete = useCallback((collectedAnswers) => {
    setAnswers(collectedAnswers)
    setScreen('results')
  }, [])

  const handleRetake = useCallback(() => {
    setScreen('home')
    setResults(null)
    setAnswers({})
  }, [])

  const handleDevResults = useCallback(() => {
    const qs = buildShortTest()
    setQuestions(qs)
    setTestType('short')
    setAnswers({})
    setResults(null)
    setScreen('results')
  }, [])

  return (
    <div className="app">
      {screen === 'home' && (
        <HomeScreen onStart={handleStart} onDevResults={handleDevResults} />
      )}
      {screen === 'setup' && (
        <ApiKeySetup onSave={handleApiKeySaved} onBack={() => setScreen('home')} />
      )}
      {screen === 'test' && (
        <TestRunner
          questions={questions}
          testType={testType}
          onComplete={handleTestComplete}
        />
      )}
      {screen === 'results' && (
        <ResultsScreen
          answers={answers}
          questions={questions}
          apiKey={apiKey}
          testType={testType}
          onRetake={handleRetake}
        />
      )}
    </div>
  )
}
