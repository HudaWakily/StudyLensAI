import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
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

    const { data, error } = await supabase
      .from('study_materials')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      throw new Error('Failed to fetch studies')
    }

    return NextResponse.json({
      studies: data,
    })
  } catch (error) {
    console.error('Studies API error:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch studies',
      },
      {
        status: 500,
      }
    )
  }
}