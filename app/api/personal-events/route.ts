import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ENABLE_MOCK_DATA, mockPersonalEvents } from '@/lib/mock-data'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  // Return mock data if enabled
  if (ENABLE_MOCK_DATA) {
    return NextResponse.json({ events: mockPersonalEvents })
  }

  try {
    const { searchParams } = new URL(req.url)
    const upcoming = searchParams.get('upcoming')
    const days = parseInt(searchParams.get('days') || '30')

    const { data, error } = await supabase
      .from('personal_events')
      .select('*')
      .order('event_date', { ascending: true })

    if (error) throw error

    return NextResponse.json({ events: data || [] })
  } catch (error: any) {
    console.error('Get personal events error:', error)
    // Return empty data if table doesn't exist
    return NextResponse.json({ events: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { data, error } = await supabase
      .from('personal_events')
      .insert(body)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ event: data })
  } catch (error: any) {
    console.error('Create personal event error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('personal_events')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ event: data })
  } catch (error: any) {
    console.error('Update personal event error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('personal_events')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete personal event error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
