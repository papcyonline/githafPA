// Comprehensive Mock Data for Personal Assistant Dashboard
// This file contains realistic demo data showcasing all features

import { format, subDays, addDays, subHours } from 'date-fns'

const today = format(new Date(), 'yyyy-MM-dd')
const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd')
const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')

// Helper to generate stable UUIDs for mock data
let idCounter = 0
const uuid = () => `mock-${++idCounter}-${Date.now().toString(36)}`

// =====================
// TASKS
// =====================
export const mockTasks = [
  {
    id: uuid(),
    user_id: 'mock-user',
    title: 'Review Q4 budget proposal',
    description: 'Go through the finance teams Q4 budget proposal and provide feedback',
    completed: false,
    due_date: today,
    due_time: '10:00',
    priority: 'high' as const,
    source: 'manual' as const,
    recording_id: null,
    created_at: subDays(new Date(), 2).toISOString(),
    updated_at: null,
  },
  {
    id: uuid(),
    user_id: 'mock-user',
    title: 'Call mom for her birthday',
    description: 'Remember to wish her happy birthday and discuss holiday plans',
    completed: false,
    due_date: today,
    due_time: '14:00',
    priority: 'urgent' as const,
    source: 'manual' as const,
    recording_id: null,
    created_at: subDays(new Date(), 1).toISOString(),
    updated_at: null,
  },
  {
    id: uuid(),
    user_id: 'mock-user',
    title: 'Submit expense report',
    description: 'Include receipts from the client dinner and travel expenses',
    completed: false,
    due_date: today,
    due_time: '17:00',
    priority: 'medium' as const,
    source: 'ai_extracted' as const,
    recording_id: null,
    created_at: subDays(new Date(), 3).toISOString(),
    updated_at: null,
  },
  {
    id: uuid(),
    user_id: 'mock-user',
    title: 'Prepare presentation slides',
    description: 'Create slides for Monday team meeting about new product launch',
    completed: false,
    due_date: today,
    due_time: '18:00',
    priority: 'high' as const,
    source: 'manual' as const,
    recording_id: null,
    created_at: subDays(new Date(), 1).toISOString(),
    updated_at: null,
  },
  {
    id: uuid(),
    user_id: 'mock-user',
    title: 'Book dentist appointment',
    description: 'Schedule annual checkup - Dr. Smith at Downtown Dental',
    completed: false,
    due_date: tomorrow,
    due_time: null,
    priority: 'low' as const,
    source: 'manual' as const,
    recording_id: null,
    created_at: subDays(new Date(), 5).toISOString(),
    updated_at: null,
  },
]

export const mockOverdueTasks = [
  {
    id: uuid(),
    user_id: 'mock-user',
    title: 'Follow up with client about contract',
    description: 'Send follow-up email to ABC Corp regarding the pending contract',
    completed: false,
    due_date: yesterday,
    due_time: '15:00',
    priority: 'urgent' as const,
    source: 'ai_extracted' as const,
    recording_id: null,
    created_at: subDays(new Date(), 4).toISOString(),
    updated_at: null,
  },
  {
    id: uuid(),
    user_id: 'mock-user',
    title: 'Pay electricity bill',
    description: 'Online payment through utility company website',
    completed: false,
    due_date: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
    due_time: null,
    priority: 'high' as const,
    source: 'manual' as const,
    recording_id: null,
    created_at: subDays(new Date(), 7).toISOString(),
    updated_at: null,
  },
]

// =====================
// CALENDAR EVENTS
// =====================
export const mockTodayEvents = [
  {
    id: uuid(),
    user_id: 'mock-user',
    title: 'Morning Stand-up',
    description: 'Daily team sync meeting',
    start_time: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
    end_time: new Date(new Date().setHours(9, 30, 0, 0)).toISOString(),
    all_day: false,
    location: 'Zoom - Meeting Room 1',
    color: '#8B5CF6',
    recording_id: null,
    reminder_minutes: [15],
    recurrence_rule: 'FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR',
    created_at: subDays(new Date(), 30).toISOString(),
    updated_at: subDays(new Date(), 30).toISOString(),
  },
  {
    id: uuid(),
    user_id: 'mock-user',
    title: 'Product Strategy Review',
    description: 'Quarterly product roadmap discussion with stakeholders',
    start_time: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
    end_time: new Date(new Date().setHours(12, 30, 0, 0)).toISOString(),
    all_day: false,
    location: 'Conference Room A',
    color: '#3B82F6',
    recording_id: null,
    reminder_minutes: [30, 10],
    recurrence_rule: null,
    created_at: subDays(new Date(), 7).toISOString(),
    updated_at: subDays(new Date(), 7).toISOString(),
  },
  {
    id: uuid(),
    user_id: 'mock-user',
    title: 'Lunch with Sarah',
    description: 'Catch up over lunch',
    start_time: new Date(new Date().setHours(12, 30, 0, 0)).toISOString(),
    end_time: new Date(new Date().setHours(13, 30, 0, 0)).toISOString(),
    all_day: false,
    location: 'Cafe Milano, 123 Main St',
    color: '#EC4899',
    recording_id: null,
    reminder_minutes: [60],
    recurrence_rule: null,
    created_at: subDays(new Date(), 3).toISOString(),
    updated_at: subDays(new Date(), 3).toISOString(),
  },
  {
    id: uuid(),
    user_id: 'mock-user',
    title: 'Gym - Personal Training',
    description: 'Session with trainer Mike',
    start_time: new Date(new Date().setHours(18, 0, 0, 0)).toISOString(),
    end_time: new Date(new Date().setHours(19, 0, 0, 0)).toISOString(),
    all_day: false,
    location: 'FitLife Gym',
    color: '#10B981',
    recording_id: null,
    reminder_minutes: [30],
    recurrence_rule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR',
    created_at: subDays(new Date(), 60).toISOString(),
    updated_at: subDays(new Date(), 60).toISOString(),
  },
]

// =====================
// REMINDERS
// =====================
export const mockReminders = [
  {
    id: uuid(),
    user_id: 'mock-user',
    title: 'Take medication',
    description: 'Daily vitamins and supplements',
    reminder_date: today,
    reminder_time: '08:00',
    notification_id: null,
    created_at: subDays(new Date(), 30).toISOString(),
  },
  {
    id: uuid(),
    user_id: 'mock-user',
    title: 'Water the plants',
    description: 'Indoor plants need watering every 3 days',
    reminder_date: today,
    reminder_time: '09:00',
    notification_id: null,
    created_at: subDays(new Date(), 10).toISOString(),
  },
  {
    id: uuid(),
    user_id: 'mock-user',
    title: 'Pick up dry cleaning',
    description: 'Suits ready at Express Cleaners on Oak Street',
    reminder_date: today,
    reminder_time: '17:30',
    notification_id: null,
    created_at: subDays(new Date(), 2).toISOString(),
  },
  {
    id: uuid(),
    user_id: 'mock-user',
    title: 'Call insurance company',
    description: 'Discuss policy renewal options',
    reminder_date: today,
    reminder_time: '14:00',
    notification_id: null,
    created_at: subDays(new Date(), 5).toISOString(),
  },
]

// =====================
// HABITS
// =====================
export const mockHabits = [
  {
    id: uuid(),
    user_id: 'mock-user',
    title: 'Morning Meditation',
    description: '10 minutes of mindfulness',
    color: '#8B5CF6',
    icon: 'brain',
    frequency: 'daily' as const,
    target_count: 1,
    current_streak: 12,
    best_streak: 21,
    is_active: true,
    completedToday: true,
    todayCount: 1,
    logs: [],
    created_at: subDays(new Date(), 45).toISOString(),
    updated_at: subDays(new Date(), 1).toISOString(),
  },
  {
    id: uuid(),
    user_id: 'mock-user',
    title: 'Read 30 minutes',
    description: 'Reading non-fiction or professional development',
    color: '#3B82F6',
    icon: 'book',
    frequency: 'daily' as const,
    target_count: 1,
    current_streak: 8,
    best_streak: 15,
    is_active: true,
    completedToday: true,
    todayCount: 1,
    logs: [],
    created_at: subDays(new Date(), 30).toISOString(),
    updated_at: subDays(new Date(), 1).toISOString(),
  },
  {
    id: uuid(),
    user_id: 'mock-user',
    title: 'Exercise',
    description: 'At least 30 minutes of physical activity',
    color: '#10B981',
    icon: 'dumbbell',
    frequency: 'daily' as const,
    target_count: 1,
    current_streak: 5,
    best_streak: 14,
    is_active: true,
    completedToday: false,
    todayCount: 0,
    logs: [],
    created_at: subDays(new Date(), 60).toISOString(),
    updated_at: subDays(new Date(), 2).toISOString(),
  },
  {
    id: uuid(),
    user_id: 'mock-user',
    title: 'Drink 8 glasses of water',
    description: 'Stay hydrated throughout the day',
    color: '#06B6D4',
    icon: 'droplet',
    frequency: 'daily' as const,
    target_count: 8,
    current_streak: 3,
    best_streak: 10,
    is_active: true,
    completedToday: false,
    todayCount: 5,
    logs: [],
    created_at: subDays(new Date(), 20).toISOString(),
    updated_at: subDays(new Date(), 1).toISOString(),
  },
  {
    id: uuid(),
    user_id: 'mock-user',
    title: 'Journal',
    description: 'Write daily reflections',
    color: '#F59E0B',
    icon: 'pencil',
    frequency: 'daily' as const,
    target_count: 1,
    current_streak: 0,
    best_streak: 7,
    is_active: true,
    completedToday: false,
    todayCount: 0,
    logs: [],
    created_at: subDays(new Date(), 14).toISOString(),
    updated_at: subDays(new Date(), 3).toISOString(),
  },
]

// =====================
// GOALS
// =====================
export const mockGoals = [
  {
    id: uuid(),
    user_id: 'mock-user',
    title: 'Save $10,000 Emergency Fund',
    description: 'Build a 6-month emergency fund',
    target_date: format(addDays(new Date(), 90), 'yyyy-MM-dd'),
    progress: 68,
    status: 'active' as const,
    category: 'Finance',
    color: '#10B981',
    milestones: [],
    created_at: subDays(new Date(), 120).toISOString(),
    updated_at: subDays(new Date(), 2).toISOString(),
  },
  {
    id: uuid(),
    user_id: 'mock-user',
    title: 'Complete AWS Certification',
    description: 'Pass AWS Solutions Architect exam',
    target_date: format(addDays(new Date(), 45), 'yyyy-MM-dd'),
    progress: 45,
    status: 'active' as const,
    category: 'Career',
    color: '#F59E0B',
    milestones: [],
    created_at: subDays(new Date(), 60).toISOString(),
    updated_at: subDays(new Date(), 5).toISOString(),
  },
  {
    id: uuid(),
    user_id: 'mock-user',
    title: 'Run a Half Marathon',
    description: 'Train and complete a 21km race',
    target_date: format(addDays(new Date(), 120), 'yyyy-MM-dd'),
    progress: 25,
    status: 'active' as const,
    category: 'Health',
    color: '#EC4899',
    milestones: [],
    created_at: subDays(new Date(), 30).toISOString(),
    updated_at: subDays(new Date(), 1).toISOString(),
  },
]

// =====================
// ACTIVITY LOG
// =====================
export const mockActivities = [
  {
    id: uuid(),
    user_id: 'mock-user',
    action_type: 'completed' as const,
    entity_type: 'task' as const,
    entity_id: uuid(),
    entity_title: 'Send weekly report to manager',
    metadata: null,
    created_at: subHours(new Date(), 1).toISOString(),
  },
  {
    id: uuid(),
    user_id: 'mock-user',
    action_type: 'created' as const,
    entity_type: 'note' as const,
    entity_id: uuid(),
    entity_title: 'Meeting notes - Product sync',
    metadata: null,
    created_at: subHours(new Date(), 2).toISOString(),
  },
  {
    id: uuid(),
    user_id: 'mock-user',
    action_type: 'completed' as const,
    entity_type: 'habit' as const,
    entity_id: uuid(),
    entity_title: 'Morning Meditation',
    metadata: null,
    created_at: subHours(new Date(), 4).toISOString(),
  },
  {
    id: uuid(),
    user_id: 'mock-user',
    action_type: 'created' as const,
    entity_type: 'recording' as const,
    entity_id: uuid(),
    entity_title: 'Client call - Project requirements',
    metadata: null,
    created_at: subHours(new Date(), 5).toISOString(),
  },
  {
    id: uuid(),
    user_id: 'mock-user',
    action_type: 'updated' as const,
    entity_type: 'goal' as const,
    entity_id: uuid(),
    entity_title: 'Save $10,000 Emergency Fund',
    metadata: { progress: 68 },
    created_at: subHours(new Date(), 8).toISOString(),
  },
  {
    id: uuid(),
    user_id: 'mock-user',
    action_type: 'created' as const,
    entity_type: 'event' as const,
    entity_id: uuid(),
    entity_title: 'Team Building Event',
    metadata: null,
    created_at: subHours(new Date(), 12).toISOString(),
  },
  {
    id: uuid(),
    user_id: 'mock-user',
    action_type: 'completed' as const,
    entity_type: 'task' as const,
    entity_id: uuid(),
    entity_title: 'Review pull request #234',
    metadata: null,
    created_at: subHours(new Date(), 24).toISOString(),
  },
]

// =====================
// FINANCIAL DATA
// =====================
export const mockFinancialInsights = {
  totalIncome: 8500,
  totalExpenses: 5230,
  netCashflow: 3270,
  savingsRate: 38.5,
  topExpenseCategories: [
    { category: 'Housing', amount: 1800, percentage: 34.4 },
    { category: 'Food & Dining', amount: 850, percentage: 16.3 },
    { category: 'Transportation', amount: 620, percentage: 11.9 },
    { category: 'Utilities', amount: 380, percentage: 7.3 },
    { category: 'Entertainment', amount: 340, percentage: 6.5 },
  ],
  budgetStatus: [
    { category: 'Dining Out', spent: 380, budget: 400, percentage: 95 },
    { category: 'Shopping', spent: 520, budget: 500, percentage: 104 },
    { category: 'Entertainment', spent: 280, budget: 350, percentage: 80 },
    { category: 'Groceries', spent: 420, budget: 600, percentage: 70 },
    { category: 'Transportation', spent: 180, budget: 300, percentage: 60 },
  ],
}

// =====================
// RISK ALERTS
// =====================
export const mockRiskAlerts = [
  {
    id: uuid(),
    alert_type: 'overdue_task',
    severity: 'high' as const,
    title: 'Overdue: Follow up with client',
    description: 'This task was due yesterday and needs immediate attention',
    entity_type: 'task',
    action_url: '/life-tasks',
    created_at: subHours(new Date(), 2).toISOString(),
  },
  {
    id: uuid(),
    alert_type: 'budget_exceed',
    severity: 'medium' as const,
    title: 'Shopping budget exceeded',
    description: 'You have spent 104% of your shopping budget this month',
    entity_type: 'finance',
    action_url: '/finance',
    created_at: subHours(new Date(), 6).toISOString(),
  },
  {
    id: uuid(),
    alert_type: 'habit_break',
    severity: 'low' as const,
    title: 'Journal streak at risk',
    description: 'You havent journaled in 3 days. Your streak will reset tomorrow.',
    entity_type: 'habit',
    action_url: '/habits',
    created_at: subHours(new Date(), 12).toISOString(),
  },
  {
    id: uuid(),
    alert_type: 'calendar_conflict',
    severity: 'medium' as const,
    title: 'Scheduling conflict detected',
    description: 'You have overlapping meetings tomorrow at 2 PM',
    entity_type: 'event',
    action_url: '/calendar',
    created_at: subHours(new Date(), 1).toISOString(),
  },
]

// =====================
// PERSONAL EVENTS
// =====================
export const mockPersonalEvents = [
  {
    id: uuid(),
    event_type: 'birthday' as const,
    person_name: 'Mom',
    relationship: 'family',
    event_date: today,
    year_known: true,
    daysUntil: 0,
    age: 62,
  },
  {
    id: uuid(),
    event_type: 'birthday' as const,
    person_name: 'Sarah Johnson',
    relationship: 'friend',
    event_date: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
    year_known: true,
    daysUntil: 3,
    age: 28,
  },
  {
    id: uuid(),
    event_type: 'anniversary' as const,
    person_name: 'Wedding Anniversary',
    relationship: 'partner',
    event_date: format(addDays(new Date(), 12), 'yyyy-MM-dd'),
    year_known: true,
    daysUntil: 12,
    age: 5,
  },
  {
    id: uuid(),
    event_type: 'birthday' as const,
    person_name: 'Mike Chen',
    relationship: 'colleague',
    event_date: format(addDays(new Date(), 18), 'yyyy-MM-dd'),
    year_known: false,
    daysUntil: 18,
  },
]

// =====================
// DAILY CHECK-IN
// =====================
export const mockDailyCheckin = {
  id: uuid(),
  checkin_type: 'morning',
  mood_score: 4,
  energy_level: 4,
  stress_level: 2,
  ai_response: 'Great start to your day! Your energy is high and stress is manageable. Consider tackling your most important task first while youre feeling motivated.',
  created_at: new Date(new Date().setHours(8, 30, 0, 0)).toISOString(),
}

// =====================
// RECORDINGS
// =====================
export const mockRecordings = [
  {
    id: uuid(),
    user_id: 'mock-user',
    title: 'Client Call - Project Requirements',
    audio_url: 'https://example.com/audio1.mp3',
    duration: 1847,
    transcript: 'Discussed the new project requirements with the client. They want to launch by Q2 with full mobile support. Key features include user authentication, dashboard analytics, and real-time notifications...',
    summary: 'Client meeting about Q2 product launch. Requirements include mobile support, user auth, analytics dashboard, and push notifications. Budget approved for additional developer resources.',
    key_points: ['Q2 launch target', 'Mobile support required', 'Additional developer budget approved'],
    is_favorite: true,
    created_at: subHours(new Date(), 5).toISOString(),
  },
  {
    id: uuid(),
    user_id: 'mock-user',
    title: 'Team Standup Notes',
    audio_url: 'https://example.com/audio2.mp3',
    duration: 542,
    transcript: 'Morning standup meeting. John is working on the API integration, Sarah is finishing the UI components, and Mike is handling the database optimization...',
    summary: 'Daily standup - team on track for sprint goals. API integration 80% complete, UI components nearly done, database optimization in progress.',
    key_points: ['API integration at 80%', 'UI components finishing today', 'DB optimization ongoing'],
    is_favorite: false,
    created_at: subHours(new Date(), 28).toISOString(),
  },
  {
    id: uuid(),
    user_id: 'mock-user',
    title: 'Personal Ideas Brainstorm',
    audio_url: 'https://example.com/audio3.mp3',
    duration: 923,
    transcript: 'Thinking about side project ideas. Could build a habit tracking app with AI coaching. Also considering a meal planning tool that integrates with grocery delivery...',
    summary: 'Brainstorming session for side projects. Top ideas: AI habit coach app, meal planning tool with delivery integration.',
    key_points: ['AI habit coaching app', 'Meal planning + grocery delivery', 'Weekend project candidates'],
    is_favorite: true,
    created_at: subDays(new Date(), 2).toISOString(),
  },
  {
    id: uuid(),
    user_id: 'mock-user',
    title: 'Weekly Review Reflection',
    audio_url: 'https://example.com/audio4.mp3',
    duration: 1205,
    transcript: null,
    summary: null,
    key_points: null,
    is_favorite: false,
    created_at: subDays(new Date(), 4).toISOString(),
  },
]

// =====================
// ENABLE MOCK DATA FLAG
// =====================
export const ENABLE_MOCK_DATA = true

// =====================
// DASHBOARD DATA AGGREGATOR
// =====================
export function getMockDashboardData() {
  const hour = new Date().getHours()
  let greeting = 'Good morning'
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon'
  else if (hour >= 17 && hour < 21) greeting = 'Good evening'
  else if (hour >= 21) greeting = 'Good night'

  const completedHabits = mockHabits.filter(h => h.completedToday).length

  return {
    greeting,
    date: format(new Date(), 'EEEE, MMMM d, yyyy'),
    todayTasks: mockTasks.filter(t => t.due_date === today),
    overdueTasks: mockOverdueTasks,
    upcomingTasks: mockTasks.filter(t => t.due_date !== today),
    todayEvents: mockTodayEvents,
    upcomingEvents: [],
    todayReminders: mockReminders,
    habits: mockHabits,
    habitsProgress: { completed: completedHabits, total: mockHabits.length },
    activeGoals: mockGoals,
    recentActivity: mockActivities,
  }
}
