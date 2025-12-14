import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { format, subDays, differenceInDays, parseISO, isBefore, startOfDay } from 'date-fns'
import { ENABLE_MOCK_DATA, mockRiskAlerts } from '@/lib/mock-data'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  // Return mock data if enabled
  if (ENABLE_MOCK_DATA) {
    return NextResponse.json({ alerts: mockRiskAlerts })
  }

  try {
    const { data, error } = await supabase
      .from('risk_alerts')
      .select('*')
      .eq('acknowledged', false)
      .order('severity', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ alerts: data || [] })
  } catch (error: any) {
    console.error('Get risk alerts error:', error)
    // Return empty data if table doesn't exist
    return NextResponse.json({ alerts: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, alertId } = await req.json()

    if (action === 'acknowledge' && alertId) {
      const { error } = await supabase
        .from('risk_alerts')
        .update({
          acknowledged: true,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', alertId)

      if (error) throw error
      return NextResponse.json({ success: true })
    }

    if (action === 'acknowledge_all') {
      const { error } = await supabase
        .from('risk_alerts')
        .update({
          acknowledged: true,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('acknowledged', false)

      if (error) throw error
      return NextResponse.json({ success: true })
    }

    if (action === 'run_detection') {
      const alerts = await runDetection()
      return NextResponse.json({ alerts })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Risk detection error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function runDetection() {
  const alerts: any[] = []
  const today = format(new Date(), 'yyyy-MM-dd')

  // Detect overdue tasks
  const { data: overdueTasks } = await supabase
    .from('tasks')
    .select('id, title, due_date, priority')
    .lt('due_date', today)
    .eq('completed', false)

  if (overdueTasks) {
    for (const task of overdueTasks) {
      const daysOverdue = differenceInDays(new Date(), parseISO(task.due_date))
      let severity = 'low'
      if (task.priority === 'urgent' || daysOverdue > 7) severity = 'critical'
      else if (task.priority === 'high' || daysOverdue > 3) severity = 'high'
      else if (daysOverdue > 1) severity = 'medium'

      alerts.push({
        alert_type: 'overdue_task',
        severity,
        title: `Overdue: ${task.title}`,
        description: `This task is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue`,
        entity_type: 'task',
        entity_id: task.id,
        action_url: '/dashboard',
      })
    }
  }

  // Detect habit breaks
  const { data: habits } = await supabase
    .from('habits')
    .select('id, title, current_streak')
    .eq('is_active', true)
    .gte('current_streak', 3)

  if (habits) {
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
    for (const habit of habits) {
      const { data: recentLogs } = await supabase
        .from('habit_logs')
        .select('completed_at')
        .eq('habit_id', habit.id)
        .gte('completed_at', yesterday)
        .limit(1)

      if (!recentLogs?.length) {
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
  }

  // Detect stalled goals
  const twoWeeksAgo = format(subDays(new Date(), 14), 'yyyy-MM-dd')
  const { data: stalledGoals } = await supabase
    .from('goals')
    .select('id, title, progress, target_date, updated_at')
    .eq('status', 'active')
    .lt('updated_at', twoWeeksAgo)

  if (stalledGoals) {
    for (const goal of stalledGoals) {
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
}
