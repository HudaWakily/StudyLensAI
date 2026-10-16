import { GoogleGenerativeAI } from '@google/generative-ai'
import { text } from 'stream/consumers'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const wordCount = text.trim().split(/\s+/).filter(Boolean).length

// About 1 vocabulary word per 30 words of text, minimum 3, maximum 15
const maxVocabulary = Math.min(15, Math.max(3, Math.ceil(wordCount / 30)))

export async function processStudyText(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.6-flash',
    generationConfig: { responseMimeType: 'application/json' },
  })

  const prompt = `You are helping a student who is studying in ${sourceLanguage} but understands ${targetLanguage} better.

Here is the study text:
"""
${text}
"""

Respond with ONLY valid JSON (no markdown, no extra text) in this exact shape:
{
  "title": "a short title for this study text, maximum 6 words, in ${targetLanguage}",
  "summary": "a concise summary in ${targetLanguage}",
  "simpleExplanation": "the same content explained simply, as if to a 12-year-old, in ${targetLanguage}",
  "vocabulary": [
    { "word": "a key word from the original text", "translation": "its meaning in ${targetLanguage}" }
  ]
}
Include at most ${maxVocabulary} vocabulary words. Choose only the words that are truly important or
 difficult for a student to learn from this text. Do not include simple filler words,
 and do not repeat a word. If the text has fewer important words than the maximum, return fewer.`

  const result = await model.generateContent(prompt)
  const responseText = result.response.text()

  const cleaned = responseText.replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(cleaned)

  // Remove duplicates and never return more than the limit
  const seen = new Set<string>()
  parsed.vocabulary = (parsed.vocabulary ?? [])
    .filter((item: { word: string; translation: string }) => {
      const key = item.word.trim().toLowerCase()
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, maxVocabulary)

  return parsed
}

export async function extractTextFromImage(
  base64Image: string,
  language: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' })

  const result = await model.generateContent([
    {
      inlineData: {
        data: base64Image,
        mimeType: 'image/jpeg', // the browser always sends JPEG after compression
      },
    },
    {
      text: `Extract all the text from this image exactly as written. The text language is "${language}". Return only the extracted text, with no comments, explanations or markdown. If there is no readable text, return an empty string.`,
    },
  ])

  return result.response.text().trim()
}