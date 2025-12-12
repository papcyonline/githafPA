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
  description: string | null
  completed: boolean
  due_date: string | null
  due_time: string | null
  priority: 'low' | 'medium' | 'high' | 'urgent'
  source: 'manual' | 'ai_extracted'
  recording_id: string | null
  created_at: string
  updated_at: string | null
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

export interface CreateTaskInput {
  title: string
  description?: string
  due_date?: string
  due_time?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  source?: 'manual' | 'ai_extracted'
  recording_id?: string
}

export const tasksService = {
  async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('due_date', { ascending: true, nullsFirst: false })

    if (error) throw error
    return data || []
  },

  async getTasksByDueDate(date: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('due_date', date)
      .eq('completed', false)
      .order('priority', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getOverdueTasks(): Promise<Task[]> {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .lt('due_date', today)
      .eq('completed', false)
      .order('due_date', { ascending: true })

    if (error) throw error
    return data || []
  },

  async createTask(input: CreateTaskInput): Promise<Task> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: input.title,
        description: input.description || null,
        due_date: input.due_date || null,
        due_time: input.due_time || null,
        priority: input.priority || 'medium',
        source: input.source || 'manual',
        recording_id: input.recording_id || null,
        completed: false,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateTask(id: string, updates: Partial<CreateTaskInput & { completed: boolean }>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
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
