import { supabase } from './supabase'
import { calendarService, CalendarEvent } from './calendar.service'
import { goalsService, Goal } from './goals.service'
import { habitsService, HabitWithLogs } from './habits.service'
import { format, isToday, isTomorrow, isPast, parseISO, startOfDay, endOfDay } from 'date-fns'
import { ENABLE_MOCK_DATA, getMockDashboardData } from './mock-data'

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

export interface ActivityLogItem {
  id: string
  user_id: string
  action_type: 'created' | 'completed' | 'updated' | 'deleted'
  entity_type: 'task' | 'note' | 'reminder' | 'recording' | 'goal' | 'habit' | 'event'
  entity_id: string
  entity_title: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface DashboardData {
  greeting: string
  date: string
  todayTasks: Task[]
  overdueTasks: Task[]
  upcomingTasks: Task[]
  todayEvents: CalendarEvent[]
  upcomingEvents: CalendarEvent[]
  todayReminders: Reminder[]
  habits: HabitWithLogs[]
  habitsProgress: { completed: number; total: number }
  activeGoals: Goal[]
  recentActivity: ActivityLogItem[]
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good night'
}

export const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    // Return mock data if enabled
    if (ENABLE_MOCK_DATA) {
      return getMockDashboardData() as DashboardData
    }

    const today = format(new Date(), 'yyyy-MM-dd')

    // Fetch all data in parallel
    const [
      tasks,
      reminders,
      todayEvents,
      upcomingEvents,
      habitsProgress,
      activeGoals,
      recentActivity,
    ] = await Promise.all([
      this.getTasks(),
      this.getReminders(),
      calendarService.getTodaysEvents(),
      calendarService.getUpcomingEvents(5),
      habitsService.getTodayProgress(),
      goalsService.getActiveGoals(),
      this.getRecentActivity(10),
    ])

    // Categorize tasks
    const todayTasks = tasks.filter(t => t.due_date === today && !t.completed)
    const overdueTasks = tasks.filter(t => {
      if (!t.due_date || t.completed) return false
      return isPast(endOfDay(parseISO(t.due_date))) && t.due_date !== today
    })
    const upcomingTasks = tasks.filter(t => {
      if (!t.due_date || t.completed) return false
      const dueDate = parseISO(t.due_date)
      return !isPast(endOfDay(dueDate)) && t.due_date !== today
    }).slice(0, 5)

    // Filter today's reminders
    const todayReminders = reminders.filter(r => r.reminder_date === today)

    return {
      greeting: getGreeting(),
      date: format(new Date(), 'EEEE, MMMM d, yyyy'),
      todayTasks,
      overdueTasks,
      upcomingTasks,
      todayEvents,
      upcomingEvents: upcomingEvents.filter(e => !isToday(parseISO(e.start_time))),
      todayReminders,
      habits: habitsProgress.habits,
      habitsProgress: { completed: habitsProgress.completed, total: habitsProgress.total },
      activeGoals: activeGoals.slice(0, 3),
      recentActivity,
    }
  },

  async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('due_date', { ascending: true, nullsFirst: false })

    if (error) throw error
    return data || []
  },

  async getTasksForToday(): Promise<Task[]> {
    const today = format(new Date(), 'yyyy-MM-dd')
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('due_date', today)
      .eq('completed', false)
      .order('priority', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getOverdueTasks(): Promise<Task[]> {
    const today = format(new Date(), 'yyyy-MM-dd')
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .lt('due_date', today)
      .eq('completed', false)
      .order('due_date', { ascending: true })

    if (error) throw error
    return data || []
  },

  async getReminders(): Promise<Reminder[]> {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .order('reminder_date', { ascending: true })

    if (error) throw error
    return data || []
  },

  async getTodayReminders(): Promise<Reminder[]> {
    const today = format(new Date(), 'yyyy-MM-dd')
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('reminder_date', today)
      .order('reminder_time', { ascending: true })

    if (error) throw error
    return data || []
  },

  async getRecentActivity(limit: number = 10): Promise<ActivityLogItem[]> {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      // Table might not exist yet
      console.warn('Activity log not available:', error.message)
      return []
    }
    return data || []
  },

  async logActivity(
    actionType: ActivityLogItem['action_type'],
    entityType: ActivityLogItem['entity_type'],
    entityId: string,
    entityTitle?: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('activity_log')
        .insert({
          user_id: user.id,
          action_type: actionType,
          entity_type: entityType,
          entity_id: entityId,
          entity_title: entityTitle || null,
          metadata: metadata || null,
        })
    } catch (err) {
      console.warn('Failed to log activity:', err)
    }
  },

  async getQuickStats(): Promise<{
    tasksToday: number
    tasksOverdue: number
    eventsToday: number
    habitsCompleted: number
    habitsTotal: number
    activeGoals: number
  }> {
    const [
      todayTasks,
      overdueTasks,
      todayEvents,
      habitsProgress,
      goals,
    ] = await Promise.all([
      this.getTasksForToday(),
      this.getOverdueTasks(),
      calendarService.getTodaysEvents(),
      habitsService.getTodayProgress(),
      goalsService.getActiveGoals(),
    ])

    return {
      tasksToday: todayTasks.length,
      tasksOverdue: overdueTasks.length,
      eventsToday: todayEvents.length,
      habitsCompleted: habitsProgress.completed,
      habitsTotal: habitsProgress.total,
      activeGoals: goals.length,
    }
  },

  // Enhanced task methods
  async createTask(
    title: string,
    options?: {
      description?: string
      due_date?: string
      due_time?: string
      priority?: Task['priority']
      source?: Task['source']
      recording_id?: string
    }
  ): Promise<Task> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title,
        description: options?.description || null,
        due_date: options?.due_date || null,
        due_time: options?.due_time || null,
        priority: options?.priority || 'medium',
        source: options?.source || 'manual',
        recording_id: options?.recording_id || null,
        completed: false,
      })
      .select()
      .single()

    if (error) throw error

    await this.logActivity('created', 'task', data.id, title)
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

    await this.logActivity(completed ? 'completed' : 'updated', 'task', data.id, data.title)
    return data
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    await this.logActivity('updated', 'task', data.id, data.title)
    return data
  },

  async deleteTask(id: string): Promise<void> {
    const { data } = await supabase
      .from('tasks')
      .select('title')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) throw error

    if (data) {
      await this.logActivity('deleted', 'task', id, data.title)
    }
  },
}
