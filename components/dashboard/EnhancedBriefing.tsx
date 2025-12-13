'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { notificationsService, NotificationPermission } from '@/lib/notifications.service'

interface BriefingStats {
  tasksCount: number
  eventsCount: number
  remindersCount: number
  overdueCount: number
  habitsCompleted: number
  habitsTotal: number
}

interface AIInsight {
  type: 'tip' | 'warning' | 'achievement' | 'suggestion'
  message: string
  action?: string
  actionUrl?: string
}

interface EnhancedBriefingProps {
  greeting: string
  date: string
  stats: BriefingStats
}

export function EnhancedBriefing({ greeting, date, stats }: EnhancedBriefingProps) {
  const { user } = useAuth()
  const firstName = user?.email?.split('@')[0] || 'there'
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [showNotificationBanner, setShowNotificationBanner] = useState(false)

  useEffect(() => {
    // Check notification permission
    if (notificationsService.isSupported()) {
      const permission = notificationsService.getPermission()
      setNotificationPermission(permission)
      setShowNotificationBanner(permission === 'default')

      // Register service worker
      notificationsService.registerServiceWorker()
    }

    // Generate AI insights based on current stats
    generateInsights()
  }, [stats])

  const generateInsights = () => {
    const newInsights: AIInsight[] = []

    // Overdue tasks warning
    if (stats.overdueCount > 0) {
      newInsights.push({
        type: 'warning',
        message: `You have ${stats.overdueCount} overdue task${stats.overdueCount > 1 ? 's' : ''}. Consider prioritizing these today.`,
        action: 'View tasks',
        actionUrl: '/dashboard',
      })
    }

    // Habit streak encouragement
    if (stats.habitsTotal > 0) {
      const completionRate = (stats.habitsCompleted / stats.habitsTotal) * 100
      if (completionRate === 100) {
        newInsights.push({
          type: 'achievement',
          message: 'All habits completed today! Keep up the great work!',
        })
      } else if (completionRate >= 50) {
        newInsights.push({
          type: 'tip',
          message: `${stats.habitsTotal - stats.habitsCompleted} habit${stats.habitsTotal - stats.habitsCompleted > 1 ? 's' : ''} left to complete today.`,
          action: 'Complete habits',
          actionUrl: '/habits',
        })
      }
    }

    // Busy day suggestion
    const totalItems = stats.tasksCount + stats.eventsCount + stats.remindersCount
    if (totalItems > 5) {
      newInsights.push({
        type: 'suggestion',
        message: 'You have a busy day ahead. Consider blocking focus time for your most important tasks.',
      })
    }

    // Clear day celebration
    if (totalItems === 0 && stats.overdueCount === 0) {
      newInsights.push({
        type: 'achievement',
        message: 'Your schedule is clear! A great opportunity for deep work or planning ahead.',
      })
    }

    // Morning productivity tip
    const hour = new Date().getHours()
    if (hour >= 6 && hour < 10 && stats.tasksCount > 0) {
      newInsights.push({
        type: 'tip',
        message: 'Morning is peak productivity time. Tackle your most challenging task first!',
      })
    }

    setInsights(newInsights.slice(0, 3)) // Show max 3 insights
  }

  const handleEnableNotifications = async () => {
    const permission = await notificationsService.requestPermission()
    setNotificationPermission(permission)
    setShowNotificationBanner(false)

    if (permission === 'granted') {
      // Show a test notification
      await notificationsService.showNotification({
        title: 'Notifications Enabled!',
        body: 'You\'ll now receive reminders and updates from PAssist AI',
      })
    }
  }

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'warning':
        return (
          <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )
      case 'achievement':
        return (
          <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        )
      case 'tip':
        return (
          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )
      case 'suggestion':
        return (
          <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        )
    }
  }

  const getInsightBgColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'warning': return 'bg-amber-500/10 border-amber-500/20'
      case 'achievement': return 'bg-green-500/10 border-green-500/20'
      case 'tip': return 'bg-blue-500/10 border-blue-500/20'
      case 'suggestion': return 'bg-purple-500/10 border-purple-500/20'
    }
  }

  return (
    <div className="space-y-4">
      {/* Notification Permission Banner */}
      {showNotificationBanner && (
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-4 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-white">Enable Notifications</p>
              <p className="text-sm text-gray-400">Get reminded about tasks, events, and important updates</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowNotificationBanner(false)}
              className="flex-1 sm:flex-initial px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Later
            </button>
            <button
              onClick={handleEnableNotifications}
              className="flex-1 sm:flex-initial px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors"
            >
              Enable
            </button>
          </div>
        </div>
      )}

      {/* Main Briefing Card */}
      <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 rounded-2xl p-6 border border-purple-700/30">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Greeting & Date */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {greeting}, {firstName}!
            </h1>
            <p className="text-gray-400 mt-1">{date}</p>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-3 mt-4">
              {stats.overdueCount > 0 && (
                <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-sm font-medium">{stats.overdueCount} overdue</span>
                </div>
              )}

              {stats.tasksCount > 0 && (
                <div className="flex items-center gap-2 bg-purple-500/20 text-purple-300 px-3 py-1.5 rounded-lg">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <span className="text-sm font-medium">{stats.tasksCount} tasks</span>
                </div>
              )}

              {stats.eventsCount > 0 && (
                <div className="flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-lg">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">{stats.eventsCount} events</span>
                </div>
              )}

              {stats.remindersCount > 0 && (
                <div className="flex items-center gap-2 bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-lg">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="text-sm font-medium">{stats.remindersCount} reminders</span>
                </div>
              )}

              {stats.tasksCount === 0 && stats.eventsCount === 0 && stats.remindersCount === 0 && stats.overdueCount === 0 && (
                <div className="flex items-center gap-2 bg-green-500/20 text-green-300 px-3 py-1.5 rounded-lg">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">Clear schedule!</span>
                </div>
              )}
            </div>
          </div>

          {/* Habits Progress */}
          {stats.habitsTotal > 0 && (
            <div className="bg-white/5 rounded-xl p-4 min-w-[200px]">
              <p className="text-sm text-gray-400 mb-2">Today's Habits</p>
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-white/10"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${(stats.habitsCompleted / stats.habitsTotal) * 125.6} 125.6`}
                      className="text-green-500"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                    {Math.round((stats.habitsCompleted / stats.habitsTotal) * 100)}%
                  </span>
                </div>
                <div>
                  <p className="text-lg font-bold">{stats.habitsCompleted}/{stats.habitsTotal}</p>
                  <p className="text-xs text-gray-400">completed</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`rounded-xl p-4 border ${getInsightBgColor(insight.type)} transition-all hover:scale-[1.02]`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200">{insight.message}</p>
                  {insight.action && insight.actionUrl && (
                    <a
                      href={insight.actionUrl}
                      className="inline-block mt-2 text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      {insight.action} →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
