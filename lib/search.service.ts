import { supabase } from './supabase'

export interface SearchResult {
  id: string
  entity_type: 'task' | 'note' | 'reminder' | 'recording' | 'goal' | 'event' | 'email' | 'document'
  entity_id: string
  title: string
  content: string | null
  keywords: string[] | null
  created_at: string
  // Extended fields from joined tables
  metadata?: Record<string, unknown>
}

export interface SearchFilters {
  entityTypes?: string[]
  dateFrom?: string
  dateTo?: string
  limit?: number
}

export const searchService = {
  async search(query: string, filters?: SearchFilters): Promise<SearchResult[]> {
    if (!query.trim()) return []

    const searchTerms = query.toLowerCase().split(' ').filter(t => t.length > 2)

    // Search across multiple tables in parallel
    const [tasks, notes, reminders, recordings, events, goals] = await Promise.all([
      this.searchTasks(searchTerms, filters),
      this.searchNotes(searchTerms, filters),
      this.searchReminders(searchTerms, filters),
      this.searchRecordings(searchTerms, filters),
      this.searchEvents(searchTerms, filters),
      this.searchGoals(searchTerms, filters),
    ])

    // Combine and sort by relevance (most recent first)
    const results = [...tasks, ...notes, ...reminders, ...recordings, ...events, ...goals]
    results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return results.slice(0, filters?.limit || 20)
  },

  async searchTasks(terms: string[], filters?: SearchFilters): Promise<SearchResult[]> {
    if (filters?.entityTypes && !filters.entityTypes.includes('task')) return []

    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, description, created_at')
      .or(`title.ilike.%${terms.join('%')},description.ilike.%${terms.join('%')}`)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.warn('Search tasks error:', error.message)
      return []
    }

    return (data || []).map(item => ({
      id: `task-${item.id}`,
      entity_type: 'task' as const,
      entity_id: item.id,
      title: item.title,
      content: item.description,
      keywords: null,
      created_at: item.created_at,
    }))
  },

  async searchNotes(terms: string[], filters?: SearchFilters): Promise<SearchResult[]> {
    if (filters?.entityTypes && !filters.entityTypes.includes('note')) return []

    const { data, error } = await supabase
      .from('notes')
      .select('id, title, content, created_at')
      .or(`title.ilike.%${terms.join('%')},content.ilike.%${terms.join('%')}`)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.warn('Search notes error:', error.message)
      return []
    }

    return (data || []).map(item => ({
      id: `note-${item.id}`,
      entity_type: 'note' as const,
      entity_id: item.id,
      title: item.title,
      content: item.content,
      keywords: null,
      created_at: item.created_at,
    }))
  },

  async searchReminders(terms: string[], filters?: SearchFilters): Promise<SearchResult[]> {
    if (filters?.entityTypes && !filters.entityTypes.includes('reminder')) return []

    const { data, error } = await supabase
      .from('reminders')
      .select('id, title, description, created_at')
      .or(`title.ilike.%${terms.join('%')},description.ilike.%${terms.join('%')}`)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.warn('Search reminders error:', error.message)
      return []
    }

    return (data || []).map(item => ({
      id: `reminder-${item.id}`,
      entity_type: 'reminder' as const,
      entity_id: item.id,
      title: item.title,
      content: item.description,
      keywords: null,
      created_at: item.created_at,
    }))
  },

  async searchRecordings(terms: string[], filters?: SearchFilters): Promise<SearchResult[]> {
    if (filters?.entityTypes && !filters.entityTypes.includes('recording')) return []

    const { data, error } = await supabase
      .from('recordings')
      .select('id, title, transcript, summary, created_at')
      .or(`title.ilike.%${terms.join('%')},transcript.ilike.%${terms.join('%')},summary.ilike.%${terms.join('%')}`)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.warn('Search recordings error:', error.message)
      return []
    }

    return (data || []).map(item => ({
      id: `recording-${item.id}`,
      entity_type: 'recording' as const,
      entity_id: item.id,
      title: item.title,
      content: item.transcript || item.summary,
      keywords: null,
      created_at: item.created_at,
    }))
  },

  async searchEvents(terms: string[], filters?: SearchFilters): Promise<SearchResult[]> {
    if (filters?.entityTypes && !filters.entityTypes.includes('event')) return []

    const { data, error } = await supabase
      .from('calendar_events')
      .select('id, title, description, created_at')
      .or(`title.ilike.%${terms.join('%')},description.ilike.%${terms.join('%')}`)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.warn('Search events error:', error.message)
      return []
    }

    return (data || []).map(item => ({
      id: `event-${item.id}`,
      entity_type: 'event' as const,
      entity_id: item.id,
      title: item.title,
      content: item.description,
      keywords: null,
      created_at: item.created_at,
    }))
  },

  async searchGoals(terms: string[], filters?: SearchFilters): Promise<SearchResult[]> {
    if (filters?.entityTypes && !filters.entityTypes.includes('goal')) return []

    const { data, error } = await supabase
      .from('goals')
      .select('id, title, description, created_at')
      .or(`title.ilike.%${terms.join('%')},description.ilike.%${terms.join('%')}`)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.warn('Search goals error:', error.message)
      return []
    }

    return (data || []).map(item => ({
      id: `goal-${item.id}`,
      entity_type: 'goal' as const,
      entity_id: item.id,
      title: item.title,
      content: item.description,
      keywords: null,
      created_at: item.created_at,
    }))
  },

  getEntityIcon(entityType: string): string {
    const icons: Record<string, string> = {
      task: '✓',
      note: '📝',
      reminder: '⏰',
      recording: '🎙️',
      event: '📅',
      goal: '🎯',
      email: '✉️',
      document: '📄',
    }
    return icons[entityType] || '📎'
  },

  getEntityUrl(entityType: string, entityId: string): string {
    const urls: Record<string, string> = {
      task: '/dashboard',
      note: '/notes',
      reminder: '/reminders',
      recording: `/recording/${entityId}`,
      event: '/calendar',
      goal: '/goals',
      email: '/email',
      document: '/documents',
    }
    return urls[entityType] || '/dashboard'
  },
}
