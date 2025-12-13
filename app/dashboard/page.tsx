'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../lib/auth-context'
import { supabase, Recording } from '../../lib/supabase'
import { dashboardService, DashboardData } from '../../lib/dashboard.service'
import { tasksService } from '../../lib/notes.service'
import { habitsService } from '../../lib/habits.service'
import AudioRecorder from '../../components/AudioRecorder'
import FloatingAIChat from '../../components/FloatingAIChat'
import {
  EnhancedBriefing,
  QuickActionsPanel,
  QuickAddModal,
  TodayOverviewWidget,
  RecentActivityFeed,
  GoalsProgressWidget,
} from '../../components/dashboard'
import { IntelligentSearchBar } from '../../components/dashboard/IntelligentSearchBar'
import { RiskAlertsWidget } from '../../components/dashboard/RiskAlertsWidget'
import { FinancialInsightsWidget } from '../../components/dashboard/FinancialInsightsWidget'
import { PersonalEventsWidget } from '../../components/dashboard/PersonalEventsWidget'
import { DailyCheckinWidget } from '../../components/dashboard/DailyCheckinWidget'
import { SmartAssignmentWidget } from '../../components/dashboard/SmartAssignmentWidget'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading, signOut } = useAuth()
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRecorder, setShowRecorder] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'longest' | 'shortest'>('recent')
  const [quickAddType, setQuickAddType] = useState<'task' | 'note' | 'reminder' | null>(null)
  const [activeView, setActiveView] = useState<'overview' | 'recordings'>('overview')
  const [showSmartResearch, setShowSmartResearch] = useState(false)

  // Audio player state
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [playbackPosition, setPlaybackPosition] = useState<{ [key: string]: number }>({})
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      fetchData()
    }
  }, [user, authLoading, router])

  const fetchData = async () => {
    try {
      const [recordingsResult, dashboardResult] = await Promise.allSettled([
        supabase
          .from('recordings')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false }),
        dashboardService.getDashboardData(),
      ])

      if (recordingsResult.status === 'fulfilled' && recordingsResult.value.data) {
        setRecordings(recordingsResult.value.data || [])
      }

      if (dashboardResult.status === 'fulfilled') {
        setDashboardData(dashboardResult.value)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleTask = async (id: string, completed: boolean) => {
    try {
      await tasksService.toggleTask(id, completed)
      fetchData()
    } catch (error) {
      console.error('Error toggling task:', error)
    }
  }

  const handleToggleHabit = async (id: string) => {
    try {
      const habit = dashboardData?.habits.find(h => h.id === id)
      if (habit?.completedToday) {
        await habitsService.unlogHabit(id)
      } else {
        await habitsService.logHabit(id)
      }
      fetchData()
    } catch (error) {
      console.error('Error toggling habit:', error)
    }
  }

  const handleQuickAdd = async (data: { title: string; description?: string; date?: string; time?: string; priority?: string }) => {
    try {
      if (quickAddType === 'task') {
        await tasksService.createTask({
          title: data.title,
          description: data.description,
          due_date: data.date,
          due_time: data.time,
          priority: data.priority as 'low' | 'medium' | 'high' | 'urgent',
        })
      } else if (quickAddType === 'note') {
        const { notesService } = await import('../../lib/notes.service')
        await notesService.createNote(data.title, data.description || '')
      } else if (quickAddType === 'reminder') {
        const { remindersService } = await import('../../lib/notes.service')
        await remindersService.createReminder(
          data.title,
          data.description || '',
          data.date || new Date().toISOString().split('T')[0],
          data.time || '09:00'
        )
      }
      fetchData()
    } catch (error) {
      console.error('Error creating item:', error)
    }
  }

  const togglePlayPause = (recordingId: string, audioUrl: string) => {
    if (currentlyPlaying === recordingId) {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      setCurrentlyPlaying(null)
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      audioRef.current = new Audio(audioUrl)
      audioRef.current.play()
      setCurrentlyPlaying(recordingId)

      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          setPlaybackPosition(prev => ({
            ...prev,
            [recordingId]: audioRef.current!.currentTime
          }))
        }
      }

      audioRef.current.onended = () => {
        setCurrentlyPlaying(null)
        setPlaybackPosition(prev => ({ ...prev, [recordingId]: 0 }))
      }
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
      }).format(date)
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else if (diffInHours < 168) {
      return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date)
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
      }).format(date)
    }
  }

  const toggleFavorite = async (recordingId: string, currentFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from('recordings')
        .update({ is_favorite: !currentFavorite })
        .eq('id', recordingId)

      if (error) throw error

      setRecordings(recordings.map(r =>
        r.id === recordingId ? { ...r, is_favorite: !currentFavorite } : r
      ))
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const deleteRecording = async (recordingId: string) => {
    if (!confirm('Are you sure you want to delete this recording?')) return

    try {
      const { error } = await supabase
        .from('recordings')
        .delete()
        .eq('id', recordingId)

      if (error) throw error

      setRecordings(recordings.filter(r => r.id !== recordingId))
    } catch (error) {
      console.error('Error deleting recording:', error)
    }
  }

  // Filter and sort recordings
  const filteredRecordings = recordings
    .filter(recording => {
      if (searchQuery && !recording.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !recording.transcript?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      const recordingDate = new Date(recording.created_at)
      const now = new Date()
      const diffInHours = (now.getTime() - recordingDate.getTime()) / (1000 * 60 * 60)

      if (selectedFilter === 'today' && diffInHours > 24) return false
      if (selectedFilter === 'week' && diffInHours > 168) return false
      if (selectedFilter === 'month' && diffInHours > 720) return false

      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'longest':
          return b.duration - a.duration
        case 'shortest':
          return a.duration - b.duration
        default:
          return 0
      }
    })

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky inset-y-0 lg:top-0 left-0 z-50 w-64 lg:h-screen bg-black border-r border-white/10 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full lg:h-screen">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <img src="/logo.png" alt="PAssist AI" className="w-10 h-10 rounded-lg" />
              <span className="text-2xl font-black">PAssist AI</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-[#A855F7]/10 text-[#A855F7] font-semibold">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Dashboard</span>
            </Link>

            <Link href="/reminders" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span>Reminders</span>
            </Link>

            <Link href="/notes" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Notes</span>
            </Link>

            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Productivity</p>
            </div>

            <Link href="/recordings" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span>Recordings</span>
            </Link>

            <Link href="/finance" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Finance</span>
            </Link>

            <Link href="/documents" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Documents</span>
            </Link>

            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Personal</p>
            </div>

            <Link href="/checkin" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Daily Check-in</span>
            </Link>

            <Link href="/personal" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>Personal Events</span>
            </Link>

            <Link href="/life-tasks" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span>Life Tasks</span>
            </Link>

            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">More</p>
            </div>

            <Link href="/chat-ai" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>AI Assistant</span>
            </Link>

            <Link href="/settings" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </Link>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 rounded-full bg-[#A855F7] flex items-center justify-center font-bold">
                {user?.email?.[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user?.email?.split('@')[0]}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="w-full mt-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/30 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 h-14 sm:h-16 border-b border-white/10 flex items-center justify-between px-3 sm:px-6 bg-black/50 backdrop-blur-lg">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* View Toggle */}
            <div className="flex bg-zinc-900 rounded-lg p-0.5 sm:p-1">
              <button
                onClick={() => setActiveView('overview')}
                className={`px-2 sm:px-4 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  activeView === 'overview' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveView('recordings')}
                className={`px-2 sm:px-4 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  activeView === 'recordings' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Recordings
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <IntelligentSearchBar />
          </div>

          <button
            onClick={() => setShowRecorder(true)}
            className="bg-[#A855F7] hover:bg-[#9333EA] px-3 sm:px-6 py-2 sm:py-2.5 rounded-full font-semibold transition-all inline-flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span className="hidden sm:inline">New Recording</span>
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-[#A855F7] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-400">Loading...</p>
            </div>
          ) : activeView === 'overview' ? (
            /* Smart Dashboard View */
            <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
              {/* Enhanced Briefing with AI Insights */}
              {dashboardData && (
                <EnhancedBriefing
                  greeting={dashboardData.greeting}
                  date={dashboardData.date}
                  stats={{
                    tasksCount: dashboardData.todayTasks.length,
                    eventsCount: dashboardData.todayEvents.length,
                    remindersCount: dashboardData.todayReminders.length,
                    overdueCount: dashboardData.overdueTasks.length,
                    habitsCompleted: dashboardData.habitsProgress.completed,
                    habitsTotal: dashboardData.habitsProgress.total,
                  }}
                />
              )}

              {/* Quick Actions */}
              <QuickActionsPanel
                onAddTask={() => setQuickAddType('task')}
                onAddNote={() => setQuickAddType('note')}
                onAddReminder={() => setQuickAddType('reminder')}
                onStartRecording={() => setShowRecorder(true)}
                onSmartResearch={() => setShowSmartResearch(true)}
              />

              {/* Personal Assistant Widgets Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <DailyCheckinWidget />
                <RiskAlertsWidget />
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Today Overview - Takes 2 columns */}
                <div className="lg:col-span-2">
                  {dashboardData && (
                    <TodayOverviewWidget
                      tasks={dashboardData.todayTasks}
                      overdueTasks={dashboardData.overdueTasks}
                      events={dashboardData.todayEvents}
                      reminders={dashboardData.todayReminders}
                      habits={dashboardData.habits}
                      onToggleTask={handleToggleTask}
                      onToggleHabit={handleToggleHabit}
                    />
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Financial Insights */}
                  <FinancialInsightsWidget />

                  {/* Personal Events */}
                  <PersonalEventsWidget />

                  {/* Goals Progress */}
                  {dashboardData && (
                    <GoalsProgressWidget goals={dashboardData.activeGoals} />
                  )}

                  {/* Recent Activity */}
                  {dashboardData && (
                    <RecentActivityFeed activities={dashboardData.recentActivity} />
                  )}
                </div>
              </div>

              {/* Recent Recordings Section */}
              {recordings.length > 0 && (
                <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-400">Recent Recordings</h3>
                    <button
                      onClick={() => setActiveView('recordings')}
                      className="text-xs text-purple-400 hover:text-purple-300"
                    >
                      View all
                    </button>
                  </div>
                  <div className="space-y-2">
                    {recordings.slice(0, 3).map((recording) => (
                      <Link
                        key={recording.id}
                        href={`/recording/${recording.id}`}
                        className="block p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{recording.title}</p>
                            <p className="text-xs text-gray-500">
                              {formatDuration(recording.duration)} - {formatDate(recording.created_at)}
                            </p>
                          </div>
                          {recording.transcript && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs flex-shrink-0">
                              Transcribed
                            </span>
                          )}
                        </div>
                        {recording.transcript && (
                          <p className="mt-2 text-xs text-gray-400 line-clamp-1 pl-[52px]">
                            "{recording.transcript}"
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Recordings View */
            <div className="space-y-4 max-w-5xl">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
                {/* Search Bar */}
                <div className="flex-1 relative sm:max-w-md">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search recordings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent placeholder-gray-500"
                  />
                </div>

                {/* Filter and Sort Row */}
                <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
                  {(['all', 'today', 'week', 'month'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedFilter(filter)}
                      className={`px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                        selectedFilter === filter
                          ? 'bg-[#A855F7] text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {filter === 'all' ? 'All' : filter === 'today' ? 'Today' : filter === 'week' ? 'Week' : 'Month'}
                    </button>
                  ))}

                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A855F7] font-semibold cursor-pointer flex-shrink-0"
                  >
                    <option value="recent">Recent</option>
                    <option value="oldest">Oldest</option>
                    <option value="longest">Longest</option>
                    <option value="shortest">Shortest</option>
                  </select>
                </div>
              </div>

              {/* Recordings List */}
              {filteredRecordings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <svg className="w-20 h-20 text-gray-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <h3 className="text-2xl font-bold mb-2">No recordings found</h3>
                  <p className="text-gray-400 mb-6">Start recording or adjust your filters</p>
                  <button
                    onClick={() => setShowRecorder(true)}
                    className="bg-[#A855F7] hover:bg-[#9333EA] px-6 py-3 rounded-full font-semibold transition-all"
                  >
                    Create Recording
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRecordings.map((recording) => {
                    const isPlaying = currentlyPlaying === recording.id
                    const progress = playbackPosition[recording.id] || 0
                    const progressPercent = recording.duration > 0 ? (progress / recording.duration) * 100 : 0

                    return (
                      <div
                        key={recording.id}
                        className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-5 hover:bg-white/10 transition-all group"
                      >
                        <div className="flex items-start gap-3 sm:gap-4">
                          {/* Play Button */}
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              togglePlayPause(recording.id, recording.audio_url)
                            }}
                            className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-full bg-[#A855F7] hover:bg-[#9333EA] flex items-center justify-center transition-all"
                          >
                            {isPlaying ? (
                              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>

                          {/* Recording Info */}
                          <div className="flex-1 min-w-0">
                            <Link href={`/recording/${recording.id}`} className="block group-hover:text-[#A855F7] transition-colors">
                              <div className="flex items-start justify-between gap-2 sm:gap-4 mb-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <h3 className="text-base sm:text-lg font-bold truncate">{recording.title}</h3>
                                  {recording.is_favorite && (
                                    <svg className="w-5 h-5 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  )}
                                </div>
                                <span className="text-sm text-gray-400 whitespace-nowrap">{formatDate(recording.created_at)}</span>
                              </div>

                              {/* Progress Bar */}
                              <div className="mb-3">
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-[#A855F7] rounded-full transition-all"
                                    style={{ width: `${progressPercent}%` }}
                                  />
                                </div>
                              </div>

                              {/* Meta Info */}
                              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-2">
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {isPlaying ? formatDuration(Math.floor(progress)) + ' / ' : ''}{formatDuration(recording.duration)}
                                </span>
                                {recording.transcript && (
                                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                                    Transcribed
                                  </span>
                                )}
                                {recording.summary && (
                                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">
                                    Summarized
                                  </span>
                                )}
                              </div>

                              {/* Transcript/Summary Preview */}
                              {(recording.transcript || recording.summary) && (
                                <p className="text-xs sm:text-sm text-gray-400 line-clamp-2">
                                  {recording.summary || `"${recording.transcript}"`}
                                </p>
                              )}
                            </Link>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                toggleFavorite(recording.id, recording.is_favorite)
                              }}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                              title={recording.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                            >
                              <svg className={`w-5 h-5 ${recording.is_favorite ? 'text-yellow-500' : 'text-gray-400'}`} fill={recording.is_favorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                deleteRecording(recording.id)
                              }}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-gray-400 hover:text-red-500"
                              title="Delete recording"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Quick Add Modal */}
      {quickAddType && (
        <QuickAddModal
          type={quickAddType}
          onClose={() => setQuickAddType(null)}
          onSubmit={handleQuickAdd}
        />
      )}

      {/* Audio Recorder Modal */}
      {showRecorder && (
        <AudioRecorder
          onClose={() => setShowRecorder(false)}
          onRecordingComplete={fetchData}
        />
      )}

      {/* Smart Research Modal */}
      {showSmartResearch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg">
            <SmartAssignmentWidget onClose={() => setShowSmartResearch(false)} />
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Floating AI Chat */}
      <FloatingAIChat />
    </div>
  )
}
