import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function processStudyText(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
) {
 const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' })

  const prompt = `You are helping a student who is studying in ${sourceLanguage} but understands ${targetLanguage} better.

Here is the study text:
"""
${text}
"""

Respond with ONLY valid JSON (no markdown, no extra text) in this exact shape:
{
  "summary": "a concise summary in ${targetLanguage}",
  "simpleExplanation": "the same content explained simply, as if to a 12-year-old, in ${targetLanguage}",
  "vocabulary": [
    { "word": "a key word from the original text", "translation": "its meaning in ${targetLanguage}" }
  ]
}
Include 5 vocabulary words, the most important/difficult ones in the text.`

  const result = await model.generateContent(prompt)
  const responseText = result.response.text()

  const cleaned = responseText.replace(/```json|```/g, '').trim()
  return JSON.parse(cleaned)
}