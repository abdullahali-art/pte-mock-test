const MODEL = 'gemini-2.0-flash'

async function callGemini(apiKey, prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Gemini API error ${res.status}`)
  }
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

// ─── Score a speaking response ────────────────────────────────────────────────
export async function scoreSpeaking(apiKey, { type, prompt, transcript, answer }) {
  const p = `You are a PTE Academic examiner. Score this ${type} response strictly on PTE criteria.

Task: ${prompt || ''}
Expected answer: ${answer || '(open-ended)'}
Student transcript: "${transcript}"

Score these dimensions (each 0–5, integers only):
- Content (did they address the task? If completely off-topic = 0, which zeros the whole question)
- Fluency (natural pacing, few hesitations, smooth delivery)
- Pronunciation (clarity, accent intelligibility)
- Vocabulary (range and accuracy of words used)
- Grammar (sentence structure accuracy)

Respond ONLY in this exact JSON format, nothing else:
{"content":3,"fluency":3,"pronunciation":3,"vocabulary":3,"grammar":3,"feedback":"One sentence of specific, actionable feedback."}`

  const raw = await callGemini(apiKey, p)
  try {
    const json = raw.match(/\{[\s\S]*\}/)?.[0]
    const result = JSON.parse(json)
    // PTE: if content=0, everything is 0
    if (result.content === 0) {
      return { content:0, fluency:0, pronunciation:0, vocabulary:0, grammar:0,
        feedback: result.feedback || 'Response did not address the task — scored zero.' }
    }
    return result
  } catch {
    return { content:2, fluency:2, pronunciation:2, vocabulary:2, grammar:2,
      feedback: 'Could not parse AI feedback. Default score applied.' }
  }
}

// ─── Score a writing response ─────────────────────────────────────────────────
export async function scoreWriting(apiKey, { type, prompt, response, wordCount }) {
  let taskInstructions = ''
  if (type === 'summarize-written-text') {
    taskInstructions = `Rules: EXACTLY one sentence, 5–75 words. If more than one sentence OR outside 5–75 words → Content = 0 which zeroes entire response.`
  } else {
    taskInstructions = `Rules: 200–300 words. Word count is ${wordCount}. Penalty for going under 200 or over 300.`
  }

  const p = `You are a PTE Academic examiner scoring a ${type === 'summarize-written-text' ? 'Summarize Written Text' : 'Write Essay'} response.

${taskInstructions}
Task/Passage: ${prompt}
Student response (${wordCount} words): "${response}"

Score these dimensions (0–5 integers):
- Content (addresses the task; if 0, entire score = 0)
- Form (follows formatting rules: word count, sentence count)
- Grammar (accuracy of sentence structures)
- Vocabulary (range, precision, appropriateness)
- Spelling (accuracy of spelling)

Respond ONLY in this JSON format:
{"content":3,"form":3,"grammar":3,"vocabulary":3,"spelling":3,"feedback":"Specific actionable feedback in one sentence."}`

  const raw = await callGemini(apiKey, p)
  try {
    const json = raw.match(/\{[\s\S]*\}/)?.[0]
    const result = JSON.parse(json)
    if (result.content === 0) {
      return { content:0, form:0, grammar:0, vocabulary:0, spelling:0,
        feedback: result.feedback || 'Content did not address the task — scored zero.' }
    }
    return result
  } catch {
    return { content:2, form:2, grammar:2, vocabulary:2, spelling:2,
      feedback: 'Could not parse AI feedback. Default score applied.' }
  }
}

// ─── Score summarize spoken text ──────────────────────────────────────────────
export async function scoreSummarizeSpokenText(apiKey, { audioText, response, wordCount }) {
  const p = `You are a PTE Academic examiner scoring a Summarize Spoken Text response.

The audio lecture was about: "${audioText}"
Student summary (${wordCount} words): "${response}"

A good summary is 50–70 words, captures the main points, and is grammatically correct.

Score (0–5 integers):
- Content (captures key points from the lecture)
- Form (50–70 words, one or more sentences, grammatically formed paragraph)
- Grammar (sentence accuracy)
- Vocabulary (appropriate academic vocabulary)
- Spelling (correct spelling)

Respond ONLY in JSON:
{"content":3,"form":3,"grammar":3,"vocabulary":3,"spelling":3,"feedback":"One sentence of specific feedback."}`

  const raw = await callGemini(apiKey, p)
  try {
    const json = raw.match(/\{[\s\S]*\}/)?.[0]
    return JSON.parse(json)
  } catch {
    return { content:2, form:2, grammar:2, vocabulary:2, spelling:2,
      feedback: 'Could not parse feedback.' }
  }
}

// ─── Generate overall test feedback ───────────────────────────────────────────
export async function generateOverallFeedback(apiKey, { scores, testType }) {
  const p = `You are a PTE Academic coach. A student just completed a ${testType} PTE mock test.

Their section scores (0–90 scale):
- Speaking: ${scores.speaking}
- Writing: ${scores.writing}
- Reading: ${scores.reading}
- Listening: ${scores.listening}
- Overall: ${scores.overall}

Give personalised feedback in this JSON format:
{
  "strengths": "One sentence about what they did well.",
  "improvements": "One sentence about the most important area to improve.",
  "studyTip": "One specific, actionable study tip for their weakest area.",
  "encouragement": "One motivating sentence."
}`

  const raw = await callGemini(apiKey, p)
  try {
    const json = raw.match(/\{[\s\S]*\}/)?.[0]
    return JSON.parse(json)
  } catch {
    return {
      strengths: 'You completed the test — a significant achievement.',
      improvements: 'Focus on the section with the lowest score.',
      studyTip: 'Practice daily with authentic PTE materials.',
      encouragement: 'Consistent practice leads to measurable improvement.',
    }
  }
}
