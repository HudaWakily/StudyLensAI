import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

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