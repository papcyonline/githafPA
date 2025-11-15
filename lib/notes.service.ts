import { supabase } from './supabase'

export interface Note {
  id: string
  user_id: string
  title: string
  content: string
  audio_uri: string | null
  created_at: string
  updated_at: string
}

export interface Reminder {
  id: string
  user_id: string
  title: string
  description: string
  reminder_date: string
  reminder_time: string
  notification_id: string | null
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  completed: boolean
  created_at: string
}

export const notesService = {
  async getNotes(): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createNote(title: string, content: string): Promise<Note> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        title,
        content,
        audio_uri: null,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateNote(id: string, title: string, content: string): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .update({ title, content })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteNote(id: string): Promise<void> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}

export const remindersService = {
  async getReminders(): Promise<Reminder[]> {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .order('reminder_date', { ascending: true })

    if (error) throw error
    return data || []
  },

  async createReminder(
    title: string,
    description: string,
    reminderDate: string,
    reminderTime: string
  ): Promise<Reminder> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('reminders')
      .insert({
        user_id: user.id,
        title,
        description,
        reminder_date: reminderDate,
        reminder_time: reminderTime,
        notification_id: null,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteReminder(id: string): Promise<void> {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}

export const tasksService = {
  async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createTask(title: string): Promise<Task> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title,
        completed: false,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async toggleTask(id: string, completed: boolean): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update({ completed })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}
