'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { remindersService, Reminder } from '@/lib/notes.service'
import { supabase } from '@/lib/supabase'
import FloatingAIChat from '@/components/FloatingAIChat'

function RemindersContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading, signOut } = useAuth()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [googleConnected, setGoogleConnected] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('09:00')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      fetchReminders()
      checkGoogleConnection()
    }
  }, [user, authLoading, router])

  useEffect(() => {
    // Check URL params for Google connection status
    const connected = searchParams.get('google_connected')
    const error = searchParams.get('error')

    if (connected === 'true') {
      setGoogleConnected(true)
      setNotification({ type: 'success', message: 'Google Calendar connected successfully!' })
      // Clear URL params
      router.replace('/reminders')
    } else if (error) {
      setNotification({ type: 'error', message: 'Failed to connect Google Calendar. Please try again.' })
      router.replace('/reminders')
    }
  }, [searchParams, router])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const checkGoogleConnection = async () => {
    if (!user) return
    try {
      const { data } = await supabase
        .from('user_google_tokens')
        .select('id')
        .eq('user_id', user.id)
        .single()

      setGoogleConnected(!!data)
    } catch {
      setGoogleConnected(false)
    }
  }

  const addToGoogleCalendar = async (reminder: Reminder) => {
    try {
      const response = await fetch('/api/google/add-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, reminder })
      })

      const data = await response.json()

      if (data.needsAuth) {
        setNotification({ type: 'error', message: 'Please connect Google Calendar in Settings first' })
        return
      }

      if (data.success) {
        setNotification({ type: 'success', message: 'Added to Google Calendar!' })
        fetchReminders() // Refresh to show sync status
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      console.error('Error adding to calendar:', error)
      setNotification({ type: 'error', message: error.message || 'Failed to add to calendar' })
    }
  }

  const fetchReminders = async () => {
    try {
      const data = await remindersService.getReminders()
      setReminders(data)
    } catch (error) {
      console.error('Error fetching reminders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!title.trim() || !date) return

    try {
      await remindersService.createReminder(title, description, date, time)
      setShowModal(false)
      resetForm()
      fetchReminders()
    } catch (error) {
      console.error('Error creating reminder:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this reminder?')) return
    try {
      await remindersService.deleteReminder(id)
      fetchReminders()
    } catch (error) {
      console.error('Error deleting reminder:', error)
    }
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setDate('')
    setTime('09:00')
  }

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0]
    return dateStr === today
  }

  const isPast = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0]
    return dateStr < today
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  // Sort reminders: today first, then upcoming, then past
  const sortedReminders = [...reminders].sort((a, b) => {
    if (isToday(a.reminder_date) && !isToday(b.reminder_date)) return -1
    if (!isToday(a.reminder_date) && isToday(b.reminder_date)) return 1
    return a.reminder_date.localeCompare(b.reminder_date) || a.reminder_time.localeCompare(b.reminder_time)
  })

  const todayReminders = sortedReminders.filter(r => isToday(r.reminder_date))
  const upcomingReminders = sortedReminders.filter(r => !isToday(r.reminder_date) && !isPast(r.reminder_date))
  const pastReminders = sortedReminders.filter(r => isPast(r.reminder_date))

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
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-black border-r border-white/10 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/10">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <img src="/logo.png" alt="MeetAI" className="w-10 h-10 rounded-lg" />
              <span className="text-2xl font-black">MeetAI</span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Dashboard</span>
            </Link>

            <Link href="/reminders" className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-[#A855F7]/10 text-[#A855F7] font-semibold">
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
              <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">More</p>
            </div>

            <Link href="/recordings" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span>Recordings</span>
            </Link>

            <Link href="/settings" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </Link>
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 rounded-full bg-[#A855F7] flex items-center justify-center font-bold">
                {user?.email?.[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user?.email?.split('@')[0]}</p>
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
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/50 backdrop-blur-lg">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-2xl font-black">Reminders</h1>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-[#A855F7] hover:bg-[#9333EA] px-6 py-2.5 rounded-full font-semibold transition-all inline-flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Reminder</span>
          </button>
        </header>

        {/* Notification Banner */}
        {notification && (
          <div className={`mx-6 mt-4 px-4 py-3 rounded-lg flex items-center gap-2 ${
            notification.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {notification.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {notification.message}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-[#A855F7] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : reminders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <svg className="w-20 h-20 text-gray-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <h3 className="text-2xl font-bold mb-2">No reminders yet</h3>
              <p className="text-gray-400 mb-6">Create a reminder or record a voice note</p>
              <button onClick={() => setShowModal(true)} className="bg-[#A855F7] hover:bg-[#9333EA] px-6 py-3 rounded-full font-semibold transition-all">
                Create Reminder
              </button>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Today */}
              {todayReminders.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-amber-400 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Today
                  </h2>
                  <div className="space-y-2">
                    {todayReminders.map(reminder => (
                      <ReminderCard key={reminder.id} reminder={reminder} onDelete={handleDelete} onAddToCalendar={addToGoogleCalendar} googleConnected={googleConnected} />
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming */}
              {upcomingReminders.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-400 mb-3">Upcoming</h2>
                  <div className="space-y-2">
                    {upcomingReminders.map(reminder => (
                      <ReminderCard key={reminder.id} reminder={reminder} onDelete={handleDelete} onAddToCalendar={addToGoogleCalendar} googleConnected={googleConnected} formatDate={formatDate} />
                    ))}
                  </div>
                </div>
              )}

              {/* Past */}
              {pastReminders.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-600 mb-3">Past</h2>
                  <div className="space-y-2 opacity-60">
                    {pastReminders.map(reminder => (
                      <ReminderCard key={reminder.id} reminder={reminder} onDelete={handleDelete} onAddToCalendar={addToGoogleCalendar} googleConnected={googleConnected} formatDate={formatDate} isPast />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">New Reminder</h2>
              <button onClick={() => { setShowModal(false); resetForm() }} className="text-gray-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  placeholder="Remind me to..."
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 resize-none"
                  rows={2}
                  placeholder="Add details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={() => { setShowModal(false); resetForm() }} className="flex-1 px-4 py-2 text-gray-400 hover:text-white transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!title.trim() || !date}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <FloatingAIChat />
    </div>
  )
}

function ReminderCard({ reminder, onDelete, onAddToCalendar, googleConnected, formatDate, isPast }: {
  reminder: Reminder & { synced_to_google?: boolean };
  onDelete: (id: string) => void;
  onAddToCalendar: (reminder: Reminder) => void;
  googleConnected: boolean;
  formatDate?: (date: string) => string;
  isPast?: boolean;
}) {
  const [adding, setAdding] = useState(false)

  const handleAddToCalendar = async () => {
    setAdding(true)
    await onAddToCalendar(reminder)
    setAdding(false)
  }

  return (
    <div className={`bg-zinc-900/50 rounded-xl border p-4 ${isPast ? 'border-zinc-800' : 'border-amber-500/30 bg-amber-500/5'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white">{reminder.title}</h3>
            {reminder.synced_to_google && (
              <span className="px-1.5 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400 flex items-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                </svg>
                Synced
              </span>
            )}
          </div>
          {reminder.description && (
            <p className="text-sm text-gray-400 mt-1">{reminder.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate ? formatDate(reminder.reminder_date) : 'Today'}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {reminder.reminder_time}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isPast && !reminder.synced_to_google && (
            <button
              onClick={handleAddToCalendar}
              disabled={adding}
              className="text-gray-500 hover:text-blue-400 transition-colors p-1"
              title={googleConnected ? "Add to Google Calendar" : "Connect Google Calendar first"}
            >
              {adding ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11v6m-3-3h6" />
                </svg>
              )}
            </button>
          )}
          <button
            onClick={() => onDelete(reminder.id)}
            className="text-gray-500 hover:text-red-500 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RemindersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <RemindersContent />
    </Suspense>
  )
}
