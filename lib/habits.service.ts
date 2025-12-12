import { supabase } from './supabase'
import { format, subDays, startOfDay, differenceInDays, parseISO } from 'date-fns'

export interface Habit {
  id: string
  user_id: string
  title: string
  description: string | null
  frequency: 'daily' | 'weekly' | 'monthly'
  target_count: number
  color: string
  icon: string
  current_streak: number
  best_streak: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  completed_at: string
  count: number
  notes: string | null
  created_at: string
}

export interface CreateHabitInput {
  title: string
  description?: string
  frequency?: 'daily' | 'weekly' | 'monthly'
  target_count?: number
  color?: string
  icon?: string
}

export interface UpdateHabitInput {
  title?: string
  description?: string
  frequency?: 'daily' | 'weekly' | 'monthly'
  target_count?: number
  color?: string
  icon?: string
  is_active?: boolean
}

export interface HabitWithLogs extends Habit {
  logs: HabitLog[]
  completedToday: boolean
  todayCount: number
}

export const habitsService = {
  async getHabits(includeInactive: boolean = false): Promise<Habit[]> {
    let query = supabase
      .from('habits')
      .select('*')
      .order('created_at', { ascending: false })

    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },

  async getHabitById(id: string): Promise<Habit | null> {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  },

  async getHabitsWithTodayStatus(): Promise<HabitWithLogs[]> {
    const habits = await this.getHabits()
    const today = format(new Date(), 'yyyy-MM-dd')

    const habitsWithLogs: HabitWithLogs[] = await Promise.all(
      habits.map(async (habit) => {
        const { data: logs } = await supabase
          .from('habit_logs')
          .select('*')
          .eq('habit_id', habit.id)
          .eq('completed_at', today)

        const todayLogs = logs || []
        const todayCount = todayLogs.reduce((sum, log) => sum + log.count, 0)

        return {
          ...habit,
          logs: todayLogs,
          completedToday: todayCount >= habit.target_count,
          todayCount,
        }
      })
    )

    return habitsWithLogs
  },

  async createHabit(input: CreateHabitInput): Promise<Habit> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('habits')
      .insert({
        user_id: user.id,
        title: input.title,
        description: input.description || null,
        frequency: input.frequency || 'daily',
        target_count: input.target_count || 1,
        color: input.color || '#F59E0B',
        icon: input.icon || 'check',
        current_streak: 0,
        best_streak: 0,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateHabit(id: string, input: UpdateHabitInput): Promise<Habit> {
    const { data, error } = await supabase
      .from('habits')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async archiveHabit(id: string): Promise<Habit> {
    return this.updateHabit(id, { is_active: false })
  },

  async restoreHabit(id: string): Promise<Habit> {
    return this.updateHabit(id, { is_active: true })
  },

  async deleteHabit(id: string): Promise<void> {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Logging methods
  async logHabit(habitId: string, count: number = 1, notes?: string): Promise<HabitLog> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const today = format(new Date(), 'yyyy-MM-dd')

    // Check if log already exists for today
    const { data: existing } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('habit_id', habitId)
      .eq('completed_at', today)
      .single()

    if (existing) {
      // Update existing log
      const { data, error } = await supabase
        .from('habit_logs')
        .update({
          count: existing.count + count,
          notes: notes || existing.notes,
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      await this.updateStreaks(habitId)
      return data
    }

    // Create new log
    const { data, error } = await supabase
      .from('habit_logs')
      .insert({
        habit_id: habitId,
        user_id: user.id,
        completed_at: today,
        count,
        notes: notes || null,
      })
      .select()
      .single()

    if (error) throw error
    await this.updateStreaks(habitId)
    return data
  },

  async unlogHabit(habitId: string): Promise<void> {
    const today = format(new Date(), 'yyyy-MM-dd')

    const { error } = await supabase
      .from('habit_logs')
      .delete()
      .eq('habit_id', habitId)
      .eq('completed_at', today)

    if (error) throw error
    await this.updateStreaks(habitId)
  },

  async getHabitLogs(habitId: string, days: number = 30): Promise<HabitLog[]> {
    const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd')

    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('habit_id', habitId)
      .gte('completed_at', startDate)
      .order('completed_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async updateStreaks(habitId: string): Promise<void> {
    const habit = await this.getHabitById(habitId)
    if (!habit) return

    const logs = await this.getHabitLogs(habitId, 365)
    const logDates = new Set(logs.map(l => l.completed_at))

    let currentStreak = 0
    let checkDate = startOfDay(new Date())

    // Count current streak
    while (true) {
      const dateStr = format(checkDate, 'yyyy-MM-dd')
      if (logDates.has(dateStr)) {
        currentStreak++
        checkDate = subDays(checkDate, 1)
      } else {
        // Allow today to be incomplete
        if (currentStreak === 0 && differenceInDays(new Date(), checkDate) === 0) {
          checkDate = subDays(checkDate, 1)
          continue
        }
        break
      }
    }

    const newBestStreak = Math.max(habit.best_streak, currentStreak)

    await supabase
      .from('habits')
      .update({
        current_streak: currentStreak,
        best_streak: newBestStreak,
      })
      .eq('id', habitId)
  },

  async getHabitContributions(habitId: string, days: number = 365): Promise<Map<string, number>> {
    const logs = await this.getHabitLogs(habitId, days)
    const contributions = new Map<string, number>()

    logs.forEach(log => {
      contributions.set(log.completed_at, log.count)
    })

    return contributions
  },

  async getTodayProgress(): Promise<{
    completed: number
    total: number
    habits: HabitWithLogs[]
  }> {
    const habits = await this.getHabitsWithTodayStatus()
    const completed = habits.filter(h => h.completedToday).length

    return {
      completed,
      total: habits.length,
      habits,
    }
  },

  async getHabitStats(habitId: string): Promise<{
    currentStreak: number
    bestStreak: number
    totalCompletions: number
    completionRate: number
  }> {
    const habit = await this.getHabitById(habitId)
    if (!habit) throw new Error('Habit not found')

    const logs = await this.getHabitLogs(habitId, 365)
    const totalCompletions = logs.length

    // Calculate completion rate (last 30 days)
    const last30DaysLogs = logs.filter(l => {
      const logDate = parseISO(l.completed_at)
      return differenceInDays(new Date(), logDate) <= 30
    })
    const completionRate = Math.round((last30DaysLogs.length / 30) * 100)

    return {
      currentStreak: habit.current_streak,
      bestStreak: habit.best_streak,
      totalCompletions,
      completionRate,
    }
  },
}
