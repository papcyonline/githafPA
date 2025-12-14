'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { calendarService, CalendarEvent } from '@/lib/calendar.service'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import FloatingAIChat from '@/components/FloatingAIChat'

export default function CalendarPage() {
  const router = useRouter()
  const { user, loading: authLoading, signOut } = useAuth()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Event form state
  const [eventTitle, setEventTitle] = useState('')
  const [eventDescription, setEventDescription] = useState('')
  const [eventStartDate, setEventStartDate] = useState('')
  const [eventStartTime, setEventStartTime] = useState('09:00')
  const [eventEndTime, setEventEndTime] = useState('10:00')
  const [eventColor, setEventColor] = useState('#8B5CF6')
  const [eventAllDay, setEventAllDay] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      fetchEvents()
    }
  }, [user, authLoading, router, currentDate])

  const fetchEvents = async () => {
    try {
      const data = await calendarService.getEventsForMonth(currentDate)
      setEvents(data)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async () => {
    if (!eventTitle.trim() || !eventStartDate) return

    try {
      const startDateTime = eventAllDay
        ? `${eventStartDate}T00:00:00`
        : `${eventStartDate}T${eventStartTime}:00`
      const endDateTime = eventAllDay
        ? `${eventStartDate}T23:59:59`
        : `${eventStartDate}T${eventEndTime}:00`

      await calendarService.createEvent({
        title: eventTitle,
        description: eventDescription,
        start_time: new Date(startDateTime).toISOString(),
        end_time: new Date(endDateTime).toISOString(),
        all_day: eventAllDay,
        color: eventColor,
      })

      setShowEventModal(false)
      resetEventForm()
      fetchEvents()
    } catch (error) {
      console.error('Error creating event:', error)
    }
  }

  const resetEventForm = () => {
    setEventTitle('')
    setEventDescription('')
    setEventStartDate('')
    setEventStartTime('09:00')
    setEventEndTime('10:00')
    setEventColor('#8B5CF6')
    setEventAllDay(false)
  }

  const openNewEventModal = (date?: Date) => {
    if (date) {
      setEventStartDate(format(date, 'yyyy-MM-dd'))
      setSelectedDate(date)
    }
    setShowEventModal(true)
  }

  const deleteEvent = async (id: string) => {
    if (!confirm('Delete this event?')) return
    try {
      await calendarService.deleteEvent(id)
      fetchEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  // Calendar grid generation
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const calendarDays: Date[] = []
  let day = calendarStart
  while (day <= calendarEnd) {
    calendarDays.push(day)
    day = addDays(day, 1)
  }

  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time)
      return isSameDay(eventDate, date)
    })
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <img src="/logo.png" alt="PAssist AI" className="w-10 h-10 rounded-lg" />
              <span className="text-2xl font-black">PAssist AI</span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              <span>Dashboard</span>
            </Link>

            <Link href="/calendar" className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-[#A855F7]/10 text-[#A855F7] font-semibold">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Calendar</span>
            </Link>

            <Link href="/goals" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Goals</span>
            </Link>

            <Link href="/habits" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Habits</span>
            </Link>

            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Content</p>
            </div>

            <Link href="/notes" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Notes</span>
            </Link>

            <Link href="/folders" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span>Folders</span>
            </Link>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gray-50">
              <div className="w-10 h-10 rounded-full bg-[#A855F7] flex items-center justify-center font-bold text-white">
                {user?.email?.[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-gray-900">{user?.email?.split('@')[0]}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button onClick={signOut} className="w-full mt-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors text-left">
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white/80 backdrop-blur-lg">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-2xl font-black">Calendar</h1>
          </div>

          <button
            onClick={() => openNewEventModal()}
            className="bg-[#A855F7] hover:bg-[#9333EA] px-6 py-2.5 rounded-full font-semibold transition-all inline-flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Event</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-gray-900">{format(currentDate, 'MMMM yyyy')}</h2>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Calendar Grid - Desktop */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-gray-200">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {calendarDays.map((date, index) => {
                const dayEvents = getEventsForDay(date)
                const isCurrentMonth = isSameMonth(date, currentDate)
                const isToday = isSameDay(date, new Date())

                return (
                  <div
                    key={index}
                    onClick={() => openNewEventModal(date)}
                    className={`min-h-[100px] p-2 border-b border-r border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      !isCurrentMonth ? 'opacity-40' : ''
                    }`}
                  >
                    <div className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                      isToday ? 'bg-purple-600 text-white' : ''
                    }`}>
                      {format(date, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm(`Delete "${event.title}"?`)) {
                              deleteEvent(event.id)
                            }
                          }}
                          className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
                          style={{ backgroundColor: event.color + '40', color: event.color }}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500">+{dayEvents.length - 3} more</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Calendar Grid - Mobile (List View) */}
          <div className="md:hidden bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Compact Week Headers */}
            <div className="grid grid-cols-7 border-b border-gray-200">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="p-2 text-center text-xs font-semibold text-gray-600">
                  {day}
                </div>
              ))}
            </div>

            {/* Compact Calendar Days */}
            <div className="grid grid-cols-7">
              {calendarDays.map((date, index) => {
                const dayEvents = getEventsForDay(date)
                const isCurrentMonth = isSameMonth(date, currentDate)
                const isToday = isSameDay(date, new Date())
                const hasEvents = dayEvents.length > 0

                return (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedDate(date)
                      if (dayEvents.length === 0) {
                        openNewEventModal(date)
                      }
                    }}
                    className={`aspect-square p-1 border-b border-r border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors flex flex-col items-center justify-center ${
                      !isCurrentMonth ? 'opacity-40' : ''
                    }`}
                  >
                    <div className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday ? 'bg-purple-600 text-white' : ''
                    }`}>
                      {format(date, 'd')}
                    </div>
                    {hasEvents && (
                      <div className="flex gap-0.5 mt-1">
                        {dayEvents.slice(0, 3).map((event, i) => (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: event.color }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Selected Day Events List */}
            {selectedDate && (
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">
                    {format(selectedDate, 'EEEE, MMM d')}
                  </h3>
                  <button
                    onClick={() => openNewEventModal(selectedDate)}
                    className="text-xs bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-full transition-colors"
                  >
                    + Add
                  </button>
                </div>
                {getEventsForDay(selectedDate).length > 0 ? (
                  <div className="space-y-2">
                    {getEventsForDay(selectedDate).map(event => (
                      <div
                        key={event.id}
                        onClick={() => {
                          if (confirm(`Delete "${event.title}"?`)) {
                            deleteEvent(event.id)
                          }
                        }}
                        className="p-3 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: event.color + '20', borderLeft: `3px solid ${event.color}` }}
                      >
                        <div className="font-medium text-sm" style={{ color: event.color }}>
                          {event.title}
                        </div>
                        {!event.all_day && (
                          <div className="text-xs text-gray-400 mt-1">
                            {format(new Date(event.start_time), 'h:mm a')} - {format(new Date(event.end_time), 'h:mm a')}
                          </div>
                        )}
                        {event.all_day && (
                          <div className="text-xs text-gray-400 mt-1">All day</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No events for this day</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md border border-gray-200 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">New Event</h2>
              <button onClick={() => { setShowEventModal(false); resetEventForm() }} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Title</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-purple-500"
                  placeholder="Event title"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Date</label>
                <input
                  type="date"
                  value={eventStartDate}
                  onChange={(e) => setEventStartDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allDay"
                  checked={eventAllDay}
                  onChange={(e) => setEventAllDay(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="allDay" className="text-sm text-gray-600">All day</label>
              </div>

              {!eventAllDay && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={eventStartTime}
                      onChange={(e) => setEventStartTime(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">End Time</label>
                    <input
                      type="time"
                      value={eventEndTime}
                      onChange={(e) => setEventEndTime(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-600 mb-1">Color</label>
                <div className="flex gap-2">
                  {['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899'].map(color => (
                    <button
                      key={color}
                      onClick={() => setEventColor(color)}
                      className={`w-8 h-8 rounded-full ${eventColor === color ? 'ring-2 ring-gray-400 ring-offset-2 ring-offset-white' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Description (optional)</label>
                <textarea
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-purple-500 resize-none"
                  rows={3}
                  placeholder="Add description..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => { setShowEventModal(false); resetEventForm() }}
                  className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEvent}
                  disabled={!eventTitle.trim() || !eventStartDate}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {sidebarOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <FloatingAIChat />
    </div>
  )
}
