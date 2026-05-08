// ─── TTS — speaks text via Web Speech API ─────────────────────────────────────
let currentUtterance = null

export function speak(text, { rate = 0.92, pitch = 1, onEnd } = {}) {
  return new Promise((resolve) => {
    stopSpeaking()
    const utter = new SpeechSynthesisUtterance(text)
    utter.rate = rate
    utter.pitch = pitch
    utter.lang = 'en-AU'
    // Prefer an English voice
    const voices = speechSynthesis.getVoices()
    const preferred = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('google'))
      || voices.find(v => v.lang.startsWith('en'))
    if (preferred) utter.voice = preferred
    utter.onend = () => { currentUtterance = null; onEnd?.(); resolve() }
    utter.onerror = () => { currentUtterance = null; resolve() }
    currentUtterance = utter
    speechSynthesis.speak(utter)
  })
}

export function stopSpeaking() {
  if (speechSynthesis.speaking || speechSynthesis.pending) {
    speechSynthesis.cancel()
  }
  currentUtterance = null
}

export function isSpeaking() {
  return speechSynthesis.speaking
}

// ─── STT — records via Web Speech API ─────────────────────────────────────────
let recognition = null

export function startRecording({ onInterim, onFinal, onEnd, onError }) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) {
    onError?.('Speech recognition not supported in this browser. Please use Chrome.')
    return null
  }
  stopRecording()
  recognition = new SpeechRecognition()
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = 'en-AU'
  recognition.maxAlternatives = 1

  let finalTranscript = ''

  recognition.onresult = (e) => {
    let interim = ''
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript
      if (e.results[i].isFinal) finalTranscript += t + ' '
      else interim += t
    }
    onInterim?.(finalTranscript + interim)
    if (finalTranscript) onFinal?.(finalTranscript.trim())
  }

  recognition.onend = () => {
    recognition = null
    onEnd?.(finalTranscript.trim())
  }

  recognition.onerror = (e) => {
    if (e.error === 'no-speech') return
    onError?.(e.error)
  }

  try {
    recognition.start()
  } catch {
    onError?.('Could not start microphone.')
    recognition = null
    return null
  }
  return recognition
}

export function stopRecording() {
  if (recognition) {
    try { recognition.stop() } catch {}
    recognition = null
  }
}

export function isRecording() {
  return recognition !== null
}

// ─── Check browser support ────────────────────────────────────────────────────
export function checkSupport() {
  return {
    tts: 'speechSynthesis' in window,
    stt: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
  }
}
