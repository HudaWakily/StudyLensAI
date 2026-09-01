import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()

  return NextResponse.json({
    message: 'Backend received your data!',
    receivedText: body.text,
    receivedSourceLanguage: body.sourceLanguage,
    receivedTargetLanguage: body.targetLanguage,
  })
}