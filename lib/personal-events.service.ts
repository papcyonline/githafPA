import { supabase } from './supabase'
import { format, addDays, parseISO, differenceInDays, setYear, isAfter, isBefore } from 'date-fns'

export interface PersonalEvent {
  id: string
  user_id: string
  event_type: 'birthday' | 'anniversary' | 'holiday' | 'memorial' | 'other'
  person_name: string
  relationship: string | null
  event_date: string
  year_known: boolean
  notes: string | null
  reminder_days_before: number[]
  gift_ideas: string[] | null
  photo_url: string | null
  created_at: string
  updated_at: string
  // Computed fields
  age?: number
  daysUntil?: number
}

export const personalEventsService = {
  async getEvents(): Promise<PersonalEvent[]> {
    const { data, error } = await supabase
      .from('personal_events')
      .select('*')
      .order('event_date', { ascending: true })

    if (error) throw error

    // Calculate days until each event
    const today = new Date()
    return (data || []).map(event => ({
      ...event,
      ...this.calculateEventDetails(event, today),
    }))
  },

  async getUpcomingEvents(days: number = 30): Promise<PersonalEvent[]> {
    const events = await this.getEvents()
    return events
      .filter(e => e.daysUntil !== undefined && e.daysUntil >= 0 && e.daysUntil <= days)
      .sort((a, b) => (a.daysUntil || 0) - (b.daysUntil || 0))
  },

  async createEvent(input: Omit<PersonalEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<PersonalEvent> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('personal_events')
      .insert({
        ...input,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateEvent(id: string, updates: Partial<PersonalEvent>): Promise<PersonalEvent> {
    const { data, error } = await supabase
      .from('personal_events')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteEvent(id: string): Promise<void> {
    const { error } = await supabase
      .from('personal_events')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  calculateEventDetails(event: PersonalEvent, today: Date = new Date()): { age?: number; daysUntil: number } {
    const eventDate = parseISO(event.event_date)
    const thisYearDate = setYear(eventDate, today.getFullYear())

    let nextOccurrence = thisYearDate
    if (isBefore(thisYearDate, today)) {
      nextOccurrence = setYear(eventDate, today.getFullYear() + 1)
    }

    const daysUntil = differenceInDays(nextOccurrence, today)

    let age: number | undefined
    if (event.year_known && event.event_type === 'birthday') {
      const birthYear = eventDate.getFullYear()
      age = today.getFullYear() - birthYear
      // Adjust if birthday hasn't happened yet this year
      if (daysUntil > 0) {
        age -= 1
      }
    }

    return { age, daysUntil }
  },

  getEventTypeIcon(type: PersonalEvent['event_type']): string {
    const icons: Record<string, string> = {
      birthday: '🎂',
      anniversary: '💍',
      holiday: '🎉',
      memorial: '🕯️',
      other: '📅',
    }
    return icons[type] || icons.other
  },

  getRelationshipColor(relationship: string | null): string {
    const colors: Record<string, string> = {
      family: 'bg-pink-500/20 text-pink-400',
      friend: 'bg-blue-500/20 text-blue-400',
      colleague: 'bg-green-500/20 text-green-400',
      partner: 'bg-purple-500/20 text-purple-400',
      other: 'bg-gray-500/20 text-gray-400',
    }
    return colors[relationship || 'other'] || colors.other
  },

  formatDaysUntil(days: number): string {
    if (days === 0) return 'Today!'
    if (days === 1) return 'Tomorrow'
    if (days <= 7) return `In ${days} days`
    if (days <= 14) return 'Next week'
    if (days <= 30) return `In ${Math.ceil(days / 7)} weeks`
    return `In ${Math.ceil(days / 30)} months`
  },
}
