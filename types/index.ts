export type ProcessResult = {
  summary: string
  simpleExplanation: string
  vocabulary: {
    word: string
    translation: string
  }[]
}

export type Study = {
  id: string
  user_id: string | null
  title: string | null
  original_text: string
  source_language: string
  target_language: string
  summary: string | null
  simple_explanation: string | null
  created_at: string
}