import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { query, filters } = await req.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const searchTerms = query.toLowerCase().trim()
    const results: any[] = []

    // Search across multiple tables in parallel
    const [tasks, notes, reminders, recordings, events, goals] = await Promise.all([
      supabase
        .from('tasks')
        .select('id, title, description, created_at')
        .or(`title.ilike.%${searchTerms}%,description.ilike.%${searchTerms}%`)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('notes')
        .select('id, title, content, created_at')
        .or(`title.ilike.%${searchTerms}%,content.ilike.%${searchTerms}%`)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('reminders')
        .select('id, title, description, created_at')
        .or(`title.ilike.%${searchTerms}%,description.ilike.%${searchTerms}%`)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('recordings')
        .select('id, title, transcript, summary, created_at')
        .or(`title.ilike.%${searchTerms}%,transcript.ilike.%${searchTerms}%,summary.ilike.%${searchTerms}%`)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('calendar_events')
        .select('id, title, description, created_at')
        .or(`title.ilike.%${searchTerms}%,description.ilike.%${searchTerms}%`)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('goals')
        .select('id, title, description, created_at')
        .or(`title.ilike.%${searchTerms}%,description.ilike.%${searchTerms}%`)
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    // Map results to unified format
    if (tasks.data) {
      results.push(...tasks.data.map(item => ({
        id: `task-${item.id}`,
        entity_type: 'task',
        entity_id: item.id,
        title: item.title,
        content: item.description,
        created_at: item.created_at,
      })))
    }

    if (notes.data) {
      results.push(...notes.data.map(item => ({
        id: `note-${item.id}`,
        entity_type: 'note',
        entity_id: item.id,
        title: item.title,
        content: item.content,
        created_at: item.created_at,
      })))
    }

    if (reminders.data) {
      results.push(...reminders.data.map(item => ({
        id: `reminder-${item.id}`,
        entity_type: 'reminder',
        entity_id: item.id,
        title: item.title,
        content: item.description,
        created_at: item.created_at,
      })))
    }

    if (recordings.data) {
      results.push(...recordings.data.map(item => ({
        id: `recording-${item.id}`,
        entity_type: 'recording',
        entity_id: item.id,
        title: item.title,
        content: item.transcript || item.summary,
        created_at: item.created_at,
      })))
    }

    if (events.data) {
      results.push(...events.data.map(item => ({
        id: `event-${item.id}`,
        entity_type: 'event',
        entity_id: item.id,
        title: item.title,
        content: item.description,
        created_at: item.created_at,
      })))
    }

    if (goals.data) {
      results.push(...goals.data.map(item => ({
        id: `goal-${item.id}`,
        entity_type: 'goal',
        entity_id: item.id,
        title: item.title,
        content: item.description,
        created_at: item.created_at,
      })))
    }

    // Sort by date and limit
    results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    const limitedResults = results.slice(0, filters?.limit || 20)

    return NextResponse.json({ results: limitedResults })
  } catch (error: any) {
    console.error('Search error:', error)
    return NextResponse.json({ error: error.message || 'Search failed' }, { status: 500 })
  }
}
