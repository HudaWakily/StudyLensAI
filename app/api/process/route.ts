import { NextRequest, NextResponse } from 'next/server'
import { processStudyText } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const result = await processStudyText(
      body.text,
      body.sourceLanguage,
      body.targetLanguage
    )

    return NextResponse.json(result)
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