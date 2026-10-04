import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'


export async function GET() {
  try {
    const { data, error } = await supabase
      .from('study_materials')
      .select('*')
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