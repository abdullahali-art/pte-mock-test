// ─── TTS — speaks text via Web Speech API ─────────────────────────────────────
let currentUtterance = null

export function speak(text, { rate = 0.92, pitch = 1, onEnd } = {}) {
  return new Promise((resolve) => {
    stopSpeaking()
    const utter = new SpeechSynthesisUtterance(text)
    utter.rate = rate
    utter.pitch = pitch
    utter.lang = 'en-AU'
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

// ─── Recording stack ──────────────────────────────────────────────────────────
// Combines:
//   1. MediaRecorder — captures actual audio (Blob) so volume/duration can be
//      verified even when STT misses words. This is what the real PTE platform
//      grades you on.
//   2. Web Speech API STT — produces a live transcript for AI scoring. STT can
//      drop out on background noise or accents, so we auto-restart it for the
//      lifetime of the recording session.
//
// One session, one stop() call, one combined result {transcript, audioBlob,
// audioUrl, durationMs, maxVolume}. Components do not need to manage either
// API directly.

let session = null

export async function startRecording({ onInterim, onFinal, onEnd, onError, onLevel } = {}) {
  await stopRecording() // ensure clean slate

  // ── 1. Get mic stream
  let stream
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    })
  } catch (e) {
    onError?.('Microphone access denied. Please allow microphone access and try again.')
    return null
  }

  // ── 2. Volume meter (so the UI can show real input level, not random bars)
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  const source = audioCtx.createMediaStreamSource(stream)
  const analyser = audioCtx.createAnalyser()
  analyser.fftSize = 512
  source.connect(analyser)
  const levelBuf = new Uint8Array(analyser.frequencyBinCount)
  let maxVolume = 0
  let levelRaf = null
  // Throttle UI level updates to ~12 Hz so the parent isn't re-rendered on
  // every animation frame — that flooded React and visibly slowed the timer.
  let lastLevelEmit = 0
  const tick = () => {
    analyser.getByteTimeDomainData(levelBuf)
    let peak = 0
    for (let i = 0; i < levelBuf.length; i++) {
      const v = Math.abs(levelBuf[i] - 128) / 128
      if (v > peak) peak = v
    }
    if (peak > maxVolume) maxVolume = peak
    const now = performance.now()
    if (onLevel && now - lastLevelEmit >= 80) {
      lastLevelEmit = now
      onLevel(peak)
    }
    levelRaf = requestAnimationFrame(tick)
  }
  tick()

  // ── 3. MediaRecorder for actual audio capture
  const chunks = []
  let mediaRecorder
  try {
    const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : ''
    mediaRecorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream)
    mediaRecorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunks.push(e.data) }
    mediaRecorder.start(250)
  } catch (e) {
    onError?.('Could not start audio recorder.')
  }

  // ── 4. STT with auto-restart
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  let finalTranscript = ''
  let recognition = null
  let sttStopped = false

  function startSTT() {
    if (!SpeechRecognition || sttStopped) return
    recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-AU'
    recognition.maxAlternatives = 1

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

    // Auto-restart on transient drop-outs so the candidate doesn't lose words.
    recognition.onend = () => {
      if (!sttStopped) {
        try { recognition.start() } catch {}
      }
    }
    recognition.onerror = (e) => {
      // Don't bubble 'no-speech' / 'aborted' as user-facing errors — these are
      // expected during pauses. Let onend handler restart the recognizer.
      if (e.error && !['no-speech', 'aborted', 'audio-capture'].includes(e.error)) {
        onError?.(e.error)
      }
    }

    try { recognition.start() } catch {}
  }

  if (!SpeechRecognition) {
    // STT unsupported — audio capture still works for scoring.
    console.warn('SpeechRecognition not supported; audio will still be recorded.')
  } else {
    startSTT()
  }

  const startedAt = Date.now()

  session = {
    stream,
    audioCtx,
    mediaRecorder,
    chunks,
    startedAt,
    stop: () => new Promise((resolve) => {
      sttStopped = true
      if (levelRaf) cancelAnimationFrame(levelRaf)
      try { recognition && recognition.stop() } catch {}
      const finishMedia = () => {
        const mime = mediaRecorder?.mimeType || 'audio/webm'
        const audioBlob = chunks.length ? new Blob(chunks, { type: mime }) : null
        const audioUrl = audioBlob ? URL.createObjectURL(audioBlob) : null
        const durationMs = Date.now() - startedAt
        stream.getTracks().forEach(t => t.stop())
        try { audioCtx.close() } catch {}
        const result = {
          transcript: finalTranscript.trim(),
          audioBlob,
          audioUrl,
          durationMs,
          maxVolume,
        }
        onEnd?.(result)
        resolve(result)
      }
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.onstop = finishMedia
        try { mediaRecorder.stop() } catch { finishMedia() }
      } else {
        finishMedia()
      }
    }),
  }

  return session
}

export function stopRecording() {
  if (!session) return Promise.resolve(null)
  const s = session
  session = null
  return s.stop()
}

export function isRecording() {
  return session !== null
}

// ─── Check browser support ────────────────────────────────────────────────────
export function checkSupport() {
  return {
    tts: 'speechSynthesis' in window,
    stt: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
    mediaRecorder: typeof MediaRecorder !== 'undefined',
    getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
  }
}
