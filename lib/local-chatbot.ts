// Local Chatbot - Provides answers from dashboard/platform data without external APIs

import { format } from 'date-fns'
import {
  mockTasks,
  mockOverdueTasks,
  mockTodayEvents,
  mockReminders,
  mockHabits,
  mockGoals,
  mockActivities,
  mockFinancialInsights,
  mockRiskAlerts,
  mockPersonalEvents,
  mockDailyCheckin,
  mockRecordings,
} from './mock-data'

interface ChatContext {
  tasks: typeof mockTasks
  overdueTasks: typeof mockOverdueTasks
  events: typeof mockTodayEvents
  reminders: typeof mockReminders
  habits: typeof mockHabits
  goals: typeof mockGoals
  activities: typeof mockActivities
  financial: typeof mockFinancialInsights
  alerts: typeof mockRiskAlerts
  personalEvents: typeof mockPersonalEvents
  checkin: typeof mockDailyCheckin
  recordings: typeof mockRecordings
}

// Get all mock data as context
function getContext(): ChatContext {
  return {
    tasks: mockTasks,
    overdueTasks: mockOverdueTasks,
    events: mockTodayEvents,
    reminders: mockReminders,
    habits: mockHabits,
    goals: mockGoals,
    activities: mockActivities,
    financial: mockFinancialInsights,
    alerts: mockRiskAlerts,
    personalEvents: mockPersonalEvents,
    checkin: mockDailyCheckin,
    recordings: mockRecordings,
  }
}

// Keywords for intent detection
const intents = {
  tasks: ['task', 'tasks', 'todo', 'to-do', 'to do', 'overdue', 'due'],
  events: ['event', 'events', 'calendar', 'meeting', 'meetings', 'schedule', 'scheduled', 'appointment'],
  reminders: ['reminder', 'reminders', 'remind', 'notification', 'alert me'],
  habits: ['habit', 'habits', 'streak', 'streaks', 'routine', 'daily routine'],
  goals: ['goal', 'goals', 'target', 'progress', 'achievement'],
  financial: ['finance', 'financial', 'money', 'budget', 'expense', 'expenses', 'income', 'spending', 'savings', 'cashflow', 'cash flow'],
  recordings: ['recording', 'recordings', 'audio', 'transcription', 'transcript', 'voice', 'voice note'],
  personal: ['birthday', 'birthdays', 'anniversary', 'anniversaries', 'personal event', 'upcoming event'],
  checkin: ['check-in', 'checkin', 'mood', 'energy', 'stress', 'how am i', 'feeling', 'wellness'],
  alerts: ['alert', 'alerts', 'risk', 'risks', 'warning', 'warnings', 'problem', 'issue'],
  summary: ['summary', 'overview', 'today', 'what do i have', 'what\'s up', 'whats up', 'brief', 'briefing'],
  greeting: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
  help: ['help', 'what can you do', 'capabilities', 'features'],
}

function detectIntent(message: string): string[] {
  const lowerMessage = message.toLowerCase()
  const detectedIntents: string[] = []

  for (const [intent, keywords] of Object.entries(intents)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      detectedIntents.push(intent)
    }
  }

  return detectedIntents.length > 0 ? detectedIntents : ['general']
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount)
}

function generateResponse(message: string): string {
  const ctx = getContext()
  const detectedIntents = detectIntent(message)
  const primaryIntent = detectedIntents[0]

  switch (primaryIntent) {
    case 'greeting':
      return generateGreeting(ctx)

    case 'help':
      return generateHelp()

    case 'tasks':
      return generateTasksResponse(ctx)

    case 'events':
      return generateEventsResponse(ctx)

    case 'reminders':
      return generateRemindersResponse(ctx)

    case 'habits':
      return generateHabitsResponse(ctx)

    case 'goals':
      return generateGoalsResponse(ctx)

    case 'financial':
      return generateFinancialResponse(ctx)

    case 'recordings':
      return generateRecordingsResponse(ctx)

    case 'personal':
      return generatePersonalEventsResponse(ctx)

    case 'checkin':
      return generateCheckinResponse(ctx)

    case 'alerts':
      return generateAlertsResponse(ctx)

    case 'summary':
      return generateSummary(ctx)

    default:
      return generateGeneralResponse(ctx, message)
  }
}

function generateGreeting(ctx: ChatContext): string {
  const hour = new Date().getHours()
  let greeting = 'Good morning'
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon'
  else if (hour >= 17) greeting = 'Good evening'

  const todayTasksCount = ctx.tasks.filter(t => t.due_date === format(new Date(), 'yyyy-MM-dd')).length
  const overdueCount = ctx.overdueTasks.length
  const eventsCount = ctx.events.length

  let response = `${greeting}! I'm your personal assistant.\n\n`
  response += `Here's a quick look at your day:\n`
  response += `• ${todayTasksCount} tasks due today\n`
  if (overdueCount > 0) {
    response += `• ${overdueCount} overdue tasks need attention\n`
  }
  response += `• ${eventsCount} events scheduled\n`
  response += `• ${ctx.reminders.length} reminders set\n\n`
  response += `What would you like to know more about?`

  return response
}

function generateHelp(): string {
  return `I can help you with:\n
📋 **Tasks** - "What are my tasks?" "Show overdue tasks"
📅 **Calendar** - "What meetings do I have?" "Today's schedule"
⏰ **Reminders** - "What reminders do I have?"
🎯 **Goals** - "How are my goals progressing?"
💰 **Finances** - "How am I doing financially?" "Show my budget"
🔄 **Habits** - "How are my habit streaks?"
🎙️ **Recordings** - "What recordings do I have?"
🎂 **Events** - "Any upcoming birthdays?"
😊 **Wellness** - "How's my mood?" "Check-in status"
⚠️ **Alerts** - "Are there any issues I should know about?"

Just ask me anything about your data!`
}

function generateTasksResponse(ctx: ChatContext): string {
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayTasks = ctx.tasks.filter(t => t.due_date === today)
  const upcomingTasks = ctx.tasks.filter(t => t.due_date !== today)

  let response = `📋 **Your Tasks**\n\n`

  if (ctx.overdueTasks.length > 0) {
    response += `🔴 **Overdue (${ctx.overdueTasks.length}):**\n`
    ctx.overdueTasks.forEach(t => {
      response += `• ${t.title} - was due ${t.due_date} [${t.priority}]\n`
    })
    response += `\n`
  }

  if (todayTasks.length > 0) {
    response += `📌 **Due Today (${todayTasks.length}):**\n`
    todayTasks.forEach(t => {
      response += `• ${t.title}${t.due_time ? ` at ${t.due_time}` : ''} [${t.priority}]\n`
    })
    response += `\n`
  }

  if (upcomingTasks.length > 0) {
    response += `📆 **Upcoming (${upcomingTasks.length}):**\n`
    upcomingTasks.slice(0, 3).forEach(t => {
      response += `• ${t.title} - due ${t.due_date}\n`
    })
  }

  if (ctx.tasks.length === 0 && ctx.overdueTasks.length === 0) {
    response = `✨ You're all caught up! No tasks at the moment.`
  }

  return response
}

function generateEventsResponse(ctx: ChatContext): string {
  let response = `📅 **Today's Schedule**\n\n`

  if (ctx.events.length === 0) {
    return `📅 No events scheduled for today. Your calendar is clear!`
  }

  ctx.events.forEach(e => {
    const startTime = new Date(e.start_time)
    const endTime = new Date(e.end_time)
    response += `• **${e.title}**\n`
    response += `  ${format(startTime, 'h:mm a')} - ${format(endTime, 'h:mm a')}\n`
    if (e.location) {
      response += `  📍 ${e.location}\n`
    }
    response += `\n`
  })

  return response
}

function generateRemindersResponse(ctx: ChatContext): string {
  let response = `⏰ **Your Reminders**\n\n`

  if (ctx.reminders.length === 0) {
    return `⏰ No reminders set. Would you like to create one?`
  }

  ctx.reminders.forEach(r => {
    response += `• **${r.title}** at ${r.reminder_time}\n`
    if (r.description) {
      response += `  ${r.description}\n`
    }
  })

  return response
}

function generateHabitsResponse(ctx: ChatContext): string {
  const completed = ctx.habits.filter(h => h.completedToday).length
  const total = ctx.habits.length

  let response = `🔄 **Habits Progress** (${completed}/${total} done today)\n\n`

  ctx.habits.forEach(h => {
    const status = h.completedToday ? '✅' : '⬜'
    response += `${status} **${h.title}**\n`
    response += `   ${h.current_streak} day streak | Best: ${h.best_streak} days\n`
  })

  return response
}

function generateGoalsResponse(ctx: ChatContext): string {
  let response = `🎯 **Your Goals**\n\n`

  if (ctx.goals.length === 0) {
    return `🎯 No goals set yet. Setting goals can help you stay focused!`
  }

  ctx.goals.forEach(g => {
    const progressBar = generateProgressBar(g.progress)
    response += `• **${g.title}**\n`
    response += `  ${progressBar} ${g.progress}%\n`
    if (g.target_date) {
      response += `  Target: ${g.target_date}\n`
    }
    response += `\n`
  })

  return response
}

function generateProgressBar(progress: number): string {
  const filled = Math.round(progress / 10)
  const empty = 10 - filled
  return '█'.repeat(filled) + '░'.repeat(empty)
}

function generateFinancialResponse(ctx: ChatContext): string {
  const f = ctx.financial

  let response = `💰 **Financial Overview (This Month)**\n\n`
  response += `📈 Income: ${formatCurrency(f.totalIncome)}\n`
  response += `📉 Expenses: ${formatCurrency(f.totalExpenses)}\n`
  response += `💵 Net: ${formatCurrency(f.netCashflow)}\n`
  response += `💾 Savings Rate: ${f.savingsRate.toFixed(1)}%\n\n`

  response += `**Top Expenses:**\n`
  f.topExpenseCategories.slice(0, 3).forEach(c => {
    response += `• ${c.category}: ${formatCurrency(c.amount)} (${c.percentage.toFixed(1)}%)\n`
  })

  const overBudget = f.budgetStatus.filter(b => b.percentage >= 100)
  const nearLimit = f.budgetStatus.filter(b => b.percentage >= 80 && b.percentage < 100)

  if (overBudget.length > 0) {
    response += `\n⚠️ **Over Budget:**\n`
    overBudget.forEach(b => {
      response += `• ${b.category}: ${b.percentage.toFixed(0)}% used\n`
    })
  }

  if (nearLimit.length > 0) {
    response += `\n⚡ **Near Limit:**\n`
    nearLimit.forEach(b => {
      response += `• ${b.category}: ${b.percentage.toFixed(0)}% used\n`
    })
  }

  return response
}

function generateRecordingsResponse(ctx: ChatContext): string {
  let response = `🎙️ **Your Recordings**\n\n`

  if (ctx.recordings.length === 0) {
    return `🎙️ No recordings yet. Tap the record button to create your first voice note!`
  }

  ctx.recordings.forEach(r => {
    const duration = Math.floor(r.duration / 60)
    const hasTranscript = r.transcript ? '✓ Transcribed' : 'Not transcribed'
    response += `• **${r.title}**\n`
    response += `  ${duration} min | ${hasTranscript}\n`
    if (r.summary) {
      response += `  📝 ${r.summary.substring(0, 80)}...\n`
    }
    response += `\n`
  })

  return response
}

function generatePersonalEventsResponse(ctx: ChatContext): string {
  let response = `🎂 **Upcoming Personal Events**\n\n`

  if (ctx.personalEvents.length === 0) {
    return `🎂 No upcoming personal events. Add birthdays and anniversaries to never forget!`
  }

  ctx.personalEvents.forEach(e => {
    const emoji = e.event_type === 'birthday' ? '🎂' : e.event_type === 'anniversary' ? '💕' : '📅'
    const urgency = e.daysUntil === 0 ? '**TODAY!**' : e.daysUntil === 1 ? 'Tomorrow' : `In ${e.daysUntil} days`
    response += `${emoji} **${e.person_name}** - ${e.event_type}\n`
    response += `   ${urgency} | ${e.relationship}\n`
    if (e.age !== undefined) {
      response += `   Turning ${e.age + 1}\n`
    }
    response += `\n`
  })

  return response
}

function generateCheckinResponse(ctx: ChatContext): string {
  const c = ctx.checkin

  const moods = ['Very Low', 'Low', 'Neutral', 'Good', 'Great']
  const energies = ['Exhausted', 'Tired', 'Okay', 'Energetic', 'Supercharged']
  const stresses = ['Calm', 'Relaxed', 'Mild', 'Stressed', 'Overwhelmed']

  let response = `😊 **Today's Check-in**\n\n`
  response += `🎭 Mood: ${moods[c.mood_score - 1]} (${c.mood_score}/5)\n`
  response += `⚡ Energy: ${energies[c.energy_level - 1]} (${c.energy_level}/5)\n`
  response += `😰 Stress: ${stresses[c.stress_level - 1]} (${c.stress_level}/5)\n\n`

  if (c.ai_response) {
    response += `💡 *${c.ai_response}*`
  }

  return response
}

function generateAlertsResponse(ctx: ChatContext): string {
  let response = `⚠️ **Risk Alerts**\n\n`

  if (ctx.alerts.length === 0) {
    return `✅ **All Clear!** No issues or alerts to report.`
  }

  ctx.alerts.forEach(a => {
    const severity = a.severity as string
    const severityEmoji = severity === 'critical' ? '🔴' : severity === 'high' ? '🟠' : severity === 'medium' ? '🟡' : '🔵'
    response += `${severityEmoji} **${a.title}**\n`
    if (a.description) {
      response += `   ${a.description}\n`
    }
    response += `\n`
  })

  return response
}

function generateSummary(ctx: ChatContext): string {
  const today = format(new Date(), 'EEEE, MMMM d')
  const hour = new Date().getHours()
  let greeting = 'Good morning'
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon'
  else if (hour >= 17) greeting = 'Good evening'

  const todayTasksCount = ctx.tasks.filter(t => t.due_date === format(new Date(), 'yyyy-MM-dd')).length
  const completedHabits = ctx.habits.filter(h => h.completedToday).length

  let response = `${greeting}! Here's your summary for **${today}**:\n\n`

  response += `📋 **Tasks:** ${todayTasksCount} due today`
  if (ctx.overdueTasks.length > 0) {
    response += `, ${ctx.overdueTasks.length} overdue`
  }
  response += `\n`

  response += `📅 **Events:** ${ctx.events.length} scheduled\n`
  response += `⏰ **Reminders:** ${ctx.reminders.length} set\n`
  response += `🔄 **Habits:** ${completedHabits}/${ctx.habits.length} completed\n`
  response += `💰 **Finances:** ${formatCurrency(ctx.financial.netCashflow)} net this month\n\n`

  // Highlights
  if (ctx.alerts.length > 0) {
    response += `⚠️ **${ctx.alerts.length} alert(s)** need your attention\n`
  }

  const todayBirthday = ctx.personalEvents.find(e => e.daysUntil === 0)
  if (todayBirthday) {
    response += `🎂 **Don't forget:** ${todayBirthday.person_name}'s ${todayBirthday.event_type} is TODAY!\n`
  }

  response += `\nWhat would you like to focus on?`

  return response
}

function generateGeneralResponse(ctx: ChatContext, message: string): string {
  // Default response for unrecognized queries
  return `I'm your personal assistant and I have access to all your data including tasks, events, finances, habits, and more.\n\nTry asking me:\n• "What's on my schedule today?"\n• "How are my finances?"\n• "Show my habit streaks"\n• "Any upcoming birthdays?"\n\nOr just say "summary" for a quick overview!`
}

// Main export function
export function getLocalChatResponse(message: string): string {
  return generateResponse(message)
}
