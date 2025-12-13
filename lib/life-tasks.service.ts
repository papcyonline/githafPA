import { supabase } from './supabase'
import { format, addDays, addMonths, addYears, parseISO, differenceInDays, isBefore, isToday } from 'date-fns'

export interface LifeTask {
  id: string
  user_id: string
  category: 'health' | 'finance' | 'home' | 'vehicle' | 'documents' | 'insurance' | 'subscriptions' | 'other'
  title: string
  description: string | null
  due_date: string | null
  recurrence_rule: string | null
  last_completed_at: string | null
  next_due_at: string | null
  reminder_days_before: number[]
  notes: string | null
  attachments: string[] | null
  is_active: boolean
  created_at: string
  updated_at: string
  // Computed fields
  daysUntilDue?: number
  isOverdue?: boolean
}

export const LIFE_TASK_CATEGORIES = {
  health: { label: 'Health', icon: '🏥', color: 'bg-red-500/20 text-red-400' },
  finance: { label: 'Finance', icon: '💰', color: 'bg-green-500/20 text-green-400' },
  home: { label: 'Home', icon: '🏠', color: 'bg-blue-500/20 text-blue-400' },
  vehicle: { label: 'Vehicle', icon: '🚗', color: 'bg-orange-500/20 text-orange-400' },
  documents: { label: 'Documents', icon: '📄', color: 'bg-purple-500/20 text-purple-400' },
  insurance: { label: 'Insurance', icon: '🛡️', color: 'bg-cyan-500/20 text-cyan-400' },
  subscriptions: { label: 'Subscriptions', icon: '📱', color: 'bg-pink-500/20 text-pink-400' },
  other: { label: 'Other', icon: '📋', color: 'bg-gray-500/20 text-gray-400' },
}

export const lifeTasksService = {
  async getTasks(options?: { category?: string; includeInactive?: boolean }): Promise<LifeTask[]> {
    let query = supabase
      .from('life_tasks')
      .select('*')
      .order('next_due_at', { ascending: true, nullsFirst: false })

    if (!options?.includeInactive) {
      query = query.eq('is_active', true)
    }

    if (options?.category) {
      query = query.eq('category', options.category)
    }

    const { data, error } = await query

    if (error) throw error

    const today = new Date()
    return (data || []).map(task => ({
      ...task,
      ...this.calculateTaskStatus(task, today),
    }))
  },

  async getUpcomingTasks(days: number = 30): Promise<LifeTask[]> {
    const tasks = await this.getTasks()
    return tasks
      .filter(t => t.daysUntilDue !== undefined && t.daysUntilDue <= days)
      .sort((a, b) => (a.daysUntilDue || 999) - (b.daysUntilDue || 999))
  },

  async getOverdueTasks(): Promise<LifeTask[]> {
    const tasks = await this.getTasks()
    return tasks.filter(t => t.isOverdue)
  },

  async createTask(input: Omit<LifeTask, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'daysUntilDue' | 'isOverdue'>): Promise<LifeTask> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Calculate next_due_at if not provided
    const next_due_at = input.next_due_at || input.due_date || null

    const { data, error } = await supabase
      .from('life_tasks')
      .insert({
        ...input,
        user_id: user.id,
        next_due_at,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateTask(id: string, updates: Partial<LifeTask>): Promise<LifeTask> {
    const { data, error } = await supabase
      .from('life_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async completeTask(id: string): Promise<LifeTask> {
    const task = await this.getTask(id)
    if (!task) throw new Error('Task not found')

    const now = new Date()
    const updates: Partial<LifeTask> = {
      last_completed_at: now.toISOString(),
    }

    // Calculate next due date based on recurrence
    if (task.recurrence_rule) {
      const nextDue = this.calculateNextDueDate(now, task.recurrence_rule)
      updates.next_due_at = format(nextDue, 'yyyy-MM-dd')
    } else {
      // Non-recurring tasks become inactive
      updates.is_active = false
    }

    return this.updateTask(id, updates)
  },

  async getTask(id: string): Promise<LifeTask | null> {
    const { data, error } = await supabase
      .from('life_tasks')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('life_tasks')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  calculateTaskStatus(task: LifeTask, today: Date = new Date()): { daysUntilDue?: number; isOverdue: boolean } {
    if (!task.next_due_at) {
      return { daysUntilDue: undefined, isOverdue: false }
    }

    const dueDate = parseISO(task.next_due_at)
    const daysUntilDue = differenceInDays(dueDate, today)
    const isOverdue = isBefore(dueDate, today) && !isToday(dueDate)

    return { daysUntilDue, isOverdue }
  },

  calculateNextDueDate(fromDate: Date, recurrenceRule: string): Date {
    switch (recurrenceRule.toLowerCase()) {
      case 'daily':
        return addDays(fromDate, 1)
      case 'weekly':
        return addDays(fromDate, 7)
      case 'biweekly':
        return addDays(fromDate, 14)
      case 'monthly':
        return addMonths(fromDate, 1)
      case 'quarterly':
        return addMonths(fromDate, 3)
      case 'biannual':
      case 'semiannual':
        return addMonths(fromDate, 6)
      case 'yearly':
      case 'annual':
        return addYears(fromDate, 1)
      default:
        // Try to parse as number of days
        const days = parseInt(recurrenceRule, 10)
        if (!isNaN(days)) {
          return addDays(fromDate, days)
        }
        return addMonths(fromDate, 1) // Default to monthly
    }
  },

  getCategoryInfo(category: LifeTask['category']) {
    return LIFE_TASK_CATEGORIES[category] || LIFE_TASK_CATEGORIES.other
  },

  formatDaysUntil(days: number | undefined): string {
    if (days === undefined) return 'No due date'
    if (days < 0) return `${Math.abs(days)} days overdue`
    if (days === 0) return 'Due today'
    if (days === 1) return 'Due tomorrow'
    if (days <= 7) return `Due in ${days} days`
    if (days <= 30) return `Due in ${Math.ceil(days / 7)} weeks`
    return `Due in ${Math.ceil(days / 30)} months`
  },

  getQuickStats(): Promise<{
    totalActive: number
    overdue: number
    dueThisWeek: number
    dueThisMonth: number
  }> {
    return this.getTasks().then(tasks => ({
      totalActive: tasks.length,
      overdue: tasks.filter(t => t.isOverdue).length,
      dueThisWeek: tasks.filter(t => t.daysUntilDue !== undefined && t.daysUntilDue >= 0 && t.daysUntilDue <= 7).length,
      dueThisMonth: tasks.filter(t => t.daysUntilDue !== undefined && t.daysUntilDue >= 0 && t.daysUntilDue <= 30).length,
    }))
  },
}
