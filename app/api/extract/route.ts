import { NextRequest, NextResponse } from 'next/server'
import { extractTextFromImage } from '@/lib/ai'
import { createClient } from '@/lib/supabase/server'

const MAX_BYTES = 4 * 1024 * 1024 // Vercel request limit is about 4.5 MB

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in' },
        { status: 401 }
      )
    }

    const form = await request.formData()
    const image = form.get('image')
    const language = String(form.get('language') ?? 'pt')

    if (!(image instanceof File)) {
      return NextResponse.json({ error: 'No image uploaded' }, { status: 400 })
    }
    if (!image.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }
    if (image.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Image is too large' }, { status: 413 })
    }

    const base64 = Buffer.from(await image.arrayBuffer()).toString('base64')
    const text = await extractTextFromImage(base64, language)

    if (!text) {
      return NextResponse.json(
        { error: 'Could not find readable text in this image' },
        { status: 422 }
      )
    }

    return NextResponse.json({ text })
  } catch (error) {
    console.error('Extract API error:', error)

    return NextResponse.json(
      { error: 'Failed to read the image' },
      { status: 500 }
    )
  }
}