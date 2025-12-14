'use client'

import { useState, useEffect, Suspense, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { remindersService, Reminder } from '@/lib/notes.service'
import { supabase } from '@/lib/supabase'
import FloatingAIChat from '@/components/FloatingAIChat'
import DashboardLayout from '@/components/DashboardLayout'
import AudioRecorder from '@/components/AudioRecorder'

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
  const [activeReminders, setActiveReminders] = useState<Reminder[]>([])
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  const audioContextRef = useRef<AudioContext | null>(null)
  const notifiedRemindersRef = useRef<Set<string>>(new Set())
  const [showRecorder, setShowRecorder] = useState(false)
  const snoozeTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('09:00')

  // Play notification sound using Web Audio API
  const playNotificationSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const ctx = audioContextRef.current

      // Create a pleasant notification chime
      const playTone = (freq: number, startTime: number, duration: number) => {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

        oscillator.frequency.value = freq
        oscillator.type = 'sine'

        gainNode.gain.setValueAtTime(0, ctx.currentTime + startTime)
        gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + startTime + 0.05)
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + startTime + duration)

        oscillator.start(ctx.currentTime + startTime)
        oscillator.stop(ctx.currentTime + startTime + duration)
      }

      // Play a pleasant three-tone chime
      playTone(523.25, 0, 0.2)    // C5
      playTone(659.25, 0.15, 0.2) // E5
      playTone(783.99, 0.3, 0.3)  // G5
    } catch (error) {
      console.error('Error playing notification sound:', error)
    }
  }, [])

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission)
        })
      }
    }
  }, [])

  // Check for due reminders
  useEffect(() => {
    if (!reminders.length) return

    const checkReminders = () => {
      const now = new Date()
      const currentDate = now.toISOString().split('T')[0]
      const currentTime = now.toTimeString().slice(0, 5)

      const dueReminders = reminders.filter(reminder => {
        const reminderKey = `${reminder.id}-${reminder.reminder_date}-${reminder.reminder_time}`
        if (notifiedRemindersRef.current.has(reminderKey)) return false

        if (reminder.reminder_date === currentDate) {
          // Check if time matches (within 1 minute window)
          const [remHour, remMin] = reminder.reminder_time.split(':').map(Number)
          const [curHour, curMin] = currentTime.split(':').map(Number)

          if (remHour === curHour && Math.abs(remMin - curMin) <= 1) {
            notifiedRemindersRef.current.add(reminderKey)
            return true
          }
        }
        return false
      })

      if (dueReminders.length > 0) {
        setActiveReminders(dueReminders)
        playNotificationSound()

        // Show browser notification
        if (notificationPermission === 'granted') {
          dueReminders.forEach(reminder => {
            new Notification('PAssist AI Reminder', {
              body: reminder.title,
              icon: '/logo.png',
              tag: reminder.id,
            })
          })
        }
      }
    }

    // Check every 30 seconds
    checkReminders()
    const interval = setInterval(checkReminders, 30000)

    return () => clearInterval(interval)
  }, [reminders, notificationPermission, playNotificationSound])

  // Dismiss active reminder
  const dismissReminder = (id: string) => {
    setActiveReminders(prev => prev.filter(r => r.id !== id))
  }

  // Snooze reminder for 5 minutes
  const snoozeReminder = (reminder: Reminder) => {
    // Dismiss the current popup
    dismissReminder(reminder.id)

    // Show toast notification
    setNotification({ type: 'success', message: 'Reminder snoozed for 5 minutes' })

    // Clear any existing snooze timer for this reminder
    const existingTimer = snoozeTimersRef.current.get(reminder.id)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // Set a new timer for 5 minutes
    const timer = setTimeout(() => {
      // Show the reminder again
      setActiveReminders(prev => [...prev, reminder])
      playNotificationSound()

      // Show browser notification
      if (notificationPermission === 'granted') {
        new Notification('PAssist AI Reminder (Snoozed)', {
          body: reminder.title,
          icon: '/logo.png',
          tag: `${reminder.id}-snooze`,
        })
      }

      // Clean up timer reference
      snoozeTimersRef.current.delete(reminder.id)
    }, 5 * 60 * 1000) // 5 minutes in milliseconds

    // Store the timer reference
    snoozeTimersRef.current.set(reminder.id, timer)
  }

  // Cleanup snooze timers on unmount
  useEffect(() => {
    return () => {
      snoozeTimersRef.current.forEach(timer => clearTimeout(timer))
      snoozeTimersRef.current.clear()
    }
  }, [])

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
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black">Reminders</h1>
            {todayReminders.length > 0 && (
              <div className="relative">
                <svg className="w-5 h-5 text-amber-400 animate-bell-ring" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full text-[10px] font-bold flex items-center justify-center text-black">
                  {todayReminders.length}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Test Sound Button */}
            <button
              onClick={playNotificationSound}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
              title="Test notification sound"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>

            {/* Voice Recording Button */}
            <button
              onClick={() => setShowRecorder(true)}
              className="flex items-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors"
              title="Record voice reminder"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span className="hidden sm:inline">Record</span>
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="bg-[#A855F7] hover:bg-[#9333EA] px-3 sm:px-6 py-2 sm:py-2.5 rounded-full font-semibold transition-all inline-flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">New Reminder</span>
            </button>
          </div>
        </div>

        {/* Active Reminder Popup */}
        {activeReminders.length > 0 && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-sm border border-amber-500/50 shadow-2xl shadow-amber-500/20 animate-pulse-slow">
              {/* Ringing Bell Animation */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center animate-ping absolute inset-0"></div>
                  <div className="w-16 h-16 rounded-full bg-amber-500/30 flex items-center justify-center relative">
                    <svg className="w-8 h-8 text-amber-400 animate-bell-ring" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="text-center mb-4">
                <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-2">Reminder</p>
                <h3 className="text-xl font-bold text-white">{activeReminders[0].title}</h3>
                {activeReminders[0].description && (
                  <p className="text-gray-400 mt-2 text-sm">{activeReminders[0].description}</p>
                )}
                <p className="text-gray-500 mt-2 text-sm">
                  {activeReminders[0].reminder_time}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => snoozeReminder(activeReminders[0])}
                  className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-gray-300 rounded-xl transition-colors text-sm font-medium"
                >
                  Snooze 5min
                </button>
                <button
                  onClick={() => dismissReminder(activeReminders[0].id)}
                  className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black rounded-xl transition-colors text-sm font-bold"
                >
                  Dismiss
                </button>
              </div>

              {activeReminders.length > 1 && (
                <p className="text-center text-gray-500 text-xs mt-3">
                  +{activeReminders.length - 1} more reminder{activeReminders.length > 2 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Notification Banner */}
        {notification && (
          <div className={`px-4 py-3 rounded-lg flex items-center gap-2 mb-6 ${
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
              <p className="text-gray-400 mb-6">Type or speak to create your first reminder</p>
              <div className="flex gap-3">
                <button onClick={() => setShowRecorder(true)} className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Record Voice
                </button>
                <button onClick={() => setShowModal(true)} className="bg-[#A855F7] hover:bg-[#9333EA] px-6 py-3 rounded-full font-semibold transition-all">
                  Type Reminder
                </button>
              </div>
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

      {/* Audio Recorder Modal */}
      {showRecorder && (
        <AudioRecorder
          onClose={() => setShowRecorder(false)}
          onRecordingComplete={fetchReminders}
          context="reminder"
          contextHint="Say something like 'Remind me to call John tomorrow at 3pm' or 'Remind me to buy groceries on Friday'"
        />
      )}

      <FloatingAIChat />
      </div>
    </DashboardLayout>
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

  // Check if reminder is due within the hour
  const isDueSoon = () => {
    if (isPast) return false
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    if (reminder.reminder_date !== today) return false

    const [remHour, remMin] = reminder.reminder_time.split(':').map(Number)
    const [curHour, curMin] = [now.getHours(), now.getMinutes()]

    const reminderMinutes = remHour * 60 + remMin
    const currentMinutes = curHour * 60 + curMin
    const diff = reminderMinutes - currentMinutes

    return diff >= 0 && diff <= 60
  }

  const dueSoon = isDueSoon()

  return (
    <div className={`bg-zinc-900/50 rounded-xl border p-3 sm:p-4 transition-all ${
      isPast ? 'border-zinc-800' : dueSoon ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10' : 'border-amber-500/30 bg-amber-500/5'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {dueSoon && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-black">
                <svg className="w-3 h-3 animate-bell-ring" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Due Soon
              </span>
            )}
            <h3 className="font-semibold text-white text-sm sm:text-base truncate">{reminder.title}</h3>
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
            <p className="text-xs sm:text-sm text-gray-400 mt-1 line-clamp-2">{reminder.description}</p>
          )}
          <div className="flex items-center gap-2 sm:gap-3 mt-2 text-xs sm:text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate ? formatDate(reminder.reminder_date) : 'Today'}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {reminder.reminder_time}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
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
