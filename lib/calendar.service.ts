import { supabase } from './supabase'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

export interface CalendarEvent {
  id: string
  user_id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  all_day: boolean
  location: string | null
  color: string
  recording_id: string | null
  reminder_minutes: number[]
  recurrence_rule: string | null
  created_at: string
  updated_at: string
}

export interface CreateEventInput {
  title: string
  description?: string
  start_time: string
  end_time: string
  all_day?: boolean
  location?: string
  color?: string
  recording_id?: string
  reminder_minutes?: number[]
  recurrence_rule?: string
}

export interface UpdateEventInput {
  title?: string
  description?: string
  start_time?: string
  end_time?: string
  all_day?: boolean
  location?: string
  color?: string
  recording_id?: string
  reminder_minutes?: number[]
  recurrence_rule?: string
}

export const calendarService = {
  async getEvents(startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
    let query = supabase
      .from('calendar_events')
      .select('*')
      .order('start_time', { ascending: true })

    if (startDate) {
      query = query.gte('start_time', startDate.toISOString())
    }
    if (endDate) {
      query = query.lte('start_time', endDate.toISOString())
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },

  async getEventsForDay(date: Date): Promise<CalendarEvent[]> {
    const start = startOfDay(date)
    const end = endOfDay(date)
    return this.getEvents(start, end)
  },

  async getEventsForWeek(date: Date): Promise<CalendarEvent[]> {
    const start = startOfWeek(date, { weekStartsOn: 0 })
    const end = endOfWeek(date, { weekStartsOn: 0 })
    return this.getEvents(start, end)
  },

  async getEventsForMonth(date: Date): Promise<CalendarEvent[]> {
    const start = startOfMonth(date)
    const end = endOfMonth(date)
    return this.getEvents(start, end)
  },

  async getEventById(id: string): Promise<CalendarEvent | null> {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  },

  async createEvent(input: CreateEventInput): Promise<CalendarEvent> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        user_id: user.id,
        title: input.title,
        description: input.description || null,
        start_time: input.start_time,
        end_time: input.end_time,
        all_day: input.all_day ?? false,
        location: input.location || null,
        color: input.color || '#8B5CF6',
        recording_id: input.recording_id || null,
        reminder_minutes: input.reminder_minutes || [15],
        recurrence_rule: input.recurrence_rule || null,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateEvent(id: string, input: UpdateEventInput): Promise<CalendarEvent> {
    const { data, error } = await supabase
      .from('calendar_events')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteEvent(id: string): Promise<void> {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getTodaysEvents(): Promise<CalendarEvent[]> {
    return this.getEventsForDay(new Date())
  },

  async getUpcomingEvents(limit: number = 5): Promise<CalendarEvent[]> {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(limit)

    if (error) throw error
    return data || []
  },

  async linkRecording(eventId: string, recordingId: string): Promise<CalendarEvent> {
    return this.updateEvent(eventId, { recording_id: recordingId })
  },

  async unlinkRecording(eventId: string): Promise<CalendarEvent> {
    return this.updateEvent(eventId, { recording_id: undefined })
  },
}
