'use client'

import { useAuth } from '@/lib/auth-context'

interface MorningBriefingWidgetProps {
  greeting: string
  date: string
  tasksCount: number
  eventsCount: number
  remindersCount: number
  overdueCount: number
}

export function MorningBriefingWidget({
  greeting,
  date,
  tasksCount,
  eventsCount,
  remindersCount,
  overdueCount,
}: MorningBriefingWidgetProps) {
  const { user } = useAuth()
  const firstName = user?.email?.split('@')[0] || 'there'

  return (
    <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl p-6 border border-purple-200 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {greeting}, {firstName}!
          </h1>
          <p className="text-gray-600 mt-1">{date}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {overdueCount > 0 && (
            <div className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1.5 rounded-lg border border-red-200">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm font-medium">{overdueCount} overdue</span>
            </div>
          )}

          {tasksCount > 0 && (
            <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-200">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span className="text-sm font-medium">{tasksCount} tasks today</span>
            </div>
          )}

          {eventsCount > 0 && (
            <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">{eventsCount} events</span>
            </div>
          )}

          {remindersCount > 0 && (
            <div className="flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-200">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="text-sm font-medium">{remindersCount} reminders</span>
            </div>
          )}

          {tasksCount === 0 && eventsCount === 0 && remindersCount === 0 && overdueCount === 0 && (
            <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-lg border border-green-200">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">Clear schedule!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
