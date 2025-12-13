import { supabase } from './supabase'
import { format, subDays, differenceInDays, parseISO, isAfter, isBefore, startOfDay } from 'date-fns'

export interface RiskAlert {
  id: string
  user_id: string
  alert_type: 'overdue_task' | 'missed_deadline' | 'calendar_conflict' | 'habit_break' | 'goal_stall' | 'budget_exceed'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string | null
  entity_type: string | null
  entity_id: string | null
  action_url: string | null
  acknowledged: boolean
  acknowledged_at: string | null
  created_at: string
}

export const riskDetectionService = {
  async runDetection(): Promise<RiskAlert[]> {
    const alerts: RiskAlert[] = []

    // Run all detection checks in parallel
    const [
      overdueTasks,
      habitBreaks,
      goalStalls,
      upcomingDeadlines,
    ] = await Promise.all([
      this.detectOverdueTasks(),
      this.detectHabitBreaks(),
      this.detectGoalStalls(),
      this.detectUpcomingDeadlines(),
    ])

    alerts.push(...overdueTasks, ...habitBreaks, ...goalStalls, ...upcomingDeadlines)

    // Store new alerts in database
    await this.storeAlerts(alerts)

    return alerts
  },

  async getActiveAlerts(): Promise<RiskAlert[]> {
    const { data, error } = await supabase
      .from('risk_alerts')
      .select('*')
      .eq('acknowledged', false)
      .order('severity', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Failed to fetch risk alerts:', error.message)
      return []
    }

    return data || []
  },

  async acknowledgeAlert(id: string): Promise<void> {
    const { error } = await supabase
      .from('risk_alerts')
      .update({
        acknowledged: true,
        acknowledged_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw error
  },

  async acknowledgeAllAlerts(): Promise<void> {
    const { error } = await supabase
      .from('risk_alerts')
      .update({
        acknowledged: true,
        acknowledged_at: new Date().toISOString(),
      })
      .eq('acknowledged', false)

    if (error) throw error
  },

  async detectOverdueTasks(): Promise<Partial<RiskAlert>[]> {
    const today = format(new Date(), 'yyyy-MM-dd')

    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, due_date, priority')
      .lt('due_date', today)
      .eq('completed', false)
      .order('due_date', { ascending: true })

    if (error || !data) return []

    return data.map(task => {
      const daysOverdue = differenceInDays(new Date(), parseISO(task.due_date))
      let severity: RiskAlert['severity'] = 'low'

      if (task.priority === 'urgent' || daysOverdue > 7) severity = 'critical'
      else if (task.priority === 'high' || daysOverdue > 3) severity = 'high'
      else if (daysOverdue > 1) severity = 'medium'

      return {
        alert_type: 'overdue_task' as const,
        severity,
        title: `Overdue: ${task.title}`,
        description: `This task is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue`,
        entity_type: 'task',
        entity_id: task.id,
        action_url: '/dashboard',
      }
    })
  },

  async detectHabitBreaks(): Promise<Partial<RiskAlert>[]> {
    const alerts: Partial<RiskAlert>[] = []

    // Get active habits
    const { data: habits, error } = await supabase
      .from('habits')
      .select('id, title, frequency, current_streak')
      .eq('is_active', true)

    if (error || !habits) return []

    // Check each habit for breaks
    for (const habit of habits) {
      const today = format(new Date(), 'yyyy-MM-dd')
      const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')

      const { data: recentLogs } = await supabase
        .from('habit_logs')
        .select('completed_at')
        .eq('habit_id', habit.id)
        .gte('completed_at', yesterday)
        .order('completed_at', { ascending: false })
        .limit(1)

      // If no log yesterday and streak was > 3, it's a potential break
      if (!recentLogs?.length && habit.current_streak >= 3) {
        alerts.push({
          alert_type: 'habit_break',
          severity: habit.current_streak >= 7 ? 'high' : 'medium',
          title: `Habit streak at risk: ${habit.title}`,
          description: `Your ${habit.current_streak}-day streak might break if not completed today`,
          entity_type: 'habit',
          entity_id: habit.id,
          action_url: '/habits',
        })
      }
    }

    return alerts
  },

  async detectGoalStalls(): Promise<Partial<RiskAlert>[]> {
    const alerts: Partial<RiskAlert>[] = []
    const twoWeeksAgo = format(subDays(new Date(), 14), 'yyyy-MM-dd')

    const { data: goals, error } = await supabase
      .from('goals')
      .select('id, title, progress, target_date, updated_at')
      .eq('status', 'active')

    if (error || !goals) return []

    for (const goal of goals) {
      // Check if goal hasn't been updated in 2 weeks
      if (goal.updated_at && isBefore(parseISO(goal.updated_at), parseISO(twoWeeksAgo))) {
        const targetDate = goal.target_date ? parseISO(goal.target_date) : null
        const isNearDeadline = targetDate && differenceInDays(targetDate, new Date()) <= 14

        alerts.push({
          alert_type: 'goal_stall',
          severity: isNearDeadline ? 'high' : 'medium',
          title: `Stalled goal: ${goal.title}`,
          description: `No progress recorded in the last 2 weeks (${goal.progress}% complete)`,
          entity_type: 'goal',
          entity_id: goal.id,
          action_url: '/goals',
        })
      }
    }

    return alerts
  },

  async detectUpcomingDeadlines(): Promise<Partial<RiskAlert>[]> {
    const alerts: Partial<RiskAlert>[] = []
    const today = startOfDay(new Date())
    const tomorrow = format(subDays(today, -1), 'yyyy-MM-dd')
    const threeDaysFromNow = format(subDays(today, -3), 'yyyy-MM-dd')

    // Check tasks with upcoming deadlines
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('id, title, due_date, priority')
      .gte('due_date', tomorrow)
      .lte('due_date', threeDaysFromNow)
      .eq('completed', false)
      .order('due_date', { ascending: true })

    if (error || !tasks) return alerts

    for (const task of tasks) {
      const daysUntilDue = differenceInDays(parseISO(task.due_date), today)

      if (daysUntilDue === 1 && (task.priority === 'high' || task.priority === 'urgent')) {
        alerts.push({
          alert_type: 'missed_deadline',
          severity: task.priority === 'urgent' ? 'high' : 'medium',
          title: `Due tomorrow: ${task.title}`,
          description: `This ${task.priority} priority task is due tomorrow`,
          entity_type: 'task',
          entity_id: task.id,
          action_url: '/dashboard',
        })
      }
    }

    return alerts
  },

  async storeAlerts(alerts: Partial<RiskAlert>[]): Promise<void> {
    if (!alerts.length) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Check for existing unacknowledged alerts to avoid duplicates
    const { data: existingAlerts } = await supabase
      .from('risk_alerts')
      .select('entity_id, alert_type')
      .eq('user_id', user.id)
      .eq('acknowledged', false)

    const existingKeys = new Set(
      (existingAlerts || []).map(a => `${a.alert_type}-${a.entity_id}`)
    )

    // Filter out duplicates
    const newAlerts = alerts.filter(
      a => !existingKeys.has(`${a.alert_type}-${a.entity_id}`)
    )

    if (!newAlerts.length) return

    const { error } = await supabase
      .from('risk_alerts')
      .insert(
        newAlerts.map(alert => ({
          ...alert,
          user_id: user.id,
        }))
      )

    if (error) {
      console.warn('Failed to store risk alerts:', error.message)
    }
  },

  getSeverityColor(severity: RiskAlert['severity']): string {
    const colors: Record<string, string> = {
      low: 'text-blue-400 bg-blue-500/20',
      medium: 'text-yellow-400 bg-yellow-500/20',
      high: 'text-orange-400 bg-orange-500/20',
      critical: 'text-red-400 bg-red-500/20',
    }
    return colors[severity] || colors.medium
  },

  getAlertIcon(alertType: RiskAlert['alert_type']): string {
    const icons: Record<string, string> = {
      overdue_task: '⚠️',
      missed_deadline: '⏰',
      calendar_conflict: '📅',
      habit_break: '🔥',
      goal_stall: '🎯',
      budget_exceed: '💰',
    }
    return icons[alertType] || '⚠️'
  },
}
