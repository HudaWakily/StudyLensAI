import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

   const { data: study, error: studyError } = await supabase
  .from('study_materials')
  .select('*')
  .eq('id', id)
  .eq('user_id', user.id)
  .single()

    if (studyError) {
      console.error('Study error:', studyError)

      return NextResponse.json(
        { error: 'Study not found' },
        { status: 404 }
      )
    }

    const { data: vocabulary, error: vocabularyError } = await supabase
      .from('vocabulary')
      .select('*')
      .eq('material_id', study.id)

    if (vocabularyError) {
      console.error('Vocabulary error:', vocabularyError)

      return NextResponse.json(
        { error: 'Failed to fetch vocabulary' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      study,
      vocabulary,
    })
  } catch (error) {
    console.error('Study API error:', error)

    return NextResponse.json(
      { error: 'Failed to fetch study' },
      { status: 500 }
    )
  }
}


export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // First delete vocabulary belonging to this study
    const { error: vocabularyError } = await supabase
      .from('vocabulary')
      .delete()
      .eq('material_id', id)

    if (vocabularyError) {
      console.error('Vocabulary delete error:', vocabularyError)

      return NextResponse.json(
        { error: 'Failed to delete vocabulary' },
        { status: 500 }
      )
    }

    // Then delete the study, only if it belongs to the logged-in user
    const { error: studyError } = await supabase
      .from('study_materials')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (studyError) {
      console.error('Study delete error:', studyError)

      return NextResponse.json(
        { error: 'Failed to delete study' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete study API error:', error)

    return NextResponse.json(
      { error: 'Failed to delete study' },
      { status: 500 }
    )
  }
}