import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const limit = searchParams.get('limit')

    let query = supabase
      .from('financial_entries')
      .select('*')
      .order('date', { ascending: false })

    if (type) query = query.eq('entry_type', type)
    if (category) query = query.eq('category', category)
    if (dateFrom) query = query.gte('date', dateFrom)
    if (dateTo) query = query.lte('date', dateTo)
    if (limit) query = query.limit(parseInt(limit))

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ entries: data || [] })
  } catch (error: any) {
    console.error('Get financial entries error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { data, error } = await supabase
      .from('financial_entries')
      .insert(body)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ entry: data })
  } catch (error: any) {
    console.error('Create financial entry error:', error)
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
      .from('financial_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ entry: data })
  } catch (error: any) {
    console.error('Update financial entry error:', error)
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
      .from('financial_entries')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete financial entry error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
