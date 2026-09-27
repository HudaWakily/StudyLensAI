import { NextRequest, NextResponse } from 'next/server'
import { processStudyText } from '@/lib/ai'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const result = await processStudyText(
      body.text,
      body.sourceLanguage,
      body.targetLanguage
    )

    const { data, error } = await supabase
      .from('study_materials')
      .insert({
        title: 'My Study',
        original_text: body.text,
        source_language: body.sourceLanguage,
        target_language: body.targetLanguage,
        summary: result.summary,
        simple_explanation: result.simpleExplanation,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw new Error('Failed to save study')
    }
    const { error: vocabularyError } = await supabase
      .from('vocabulary')
      .insert(
        result.vocabulary.map((item) => ({
          material_id: data.id,
          word: item.word,
          translation: item.translation,
        }))
      )

    if (vocabularyError) {
      console.error('Vocabulary Supabase error:', vocabularyError)
      throw new Error('Failed to save vocabulary')
    }

    return NextResponse.json({
      result,
      study: data,
    })
  } catch (error) {
    console.error('Process API error:', error)

    return NextResponse.json(
      {
        error: 'Failed to process study text',
      },
      {
        status: 500,
      }
    )
  }
}