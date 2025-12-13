'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { format, parseISO, differenceInDays, setYear, isBefore } from 'date-fns'
import DashboardLayout from '@/components/DashboardLayout'
import AudioRecorder from '@/components/AudioRecorder'

interface PersonalEvent {
  id: string
  event_type: 'birthday' | 'anniversary' | 'holiday' | 'memorial' | 'other'
  person_name: string
  relationship: string | null
  event_date: string
  year_known: boolean
  notes: string | null
  gift_ideas: string[] | null
  daysUntil?: number
  age?: number
}

const EventIcon = ({ type, className = "w-6 h-6" }: { type: string; className?: string }) => {
  switch (type) {
    case 'birthday':
      return (
        <svg className={`${className} text-pink-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
        </svg>
      )
    case 'anniversary':
      return (
        <svg className={`${className} text-purple-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    case 'holiday':
      return (
        <svg className={`${className} text-yellow-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    case 'memorial':
      return (
        <svg className={`${className} text-gray-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
        </svg>
      )
    default:
      return (
        <svg className={`${className} text-blue-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
  }
}

const GiftIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={`${className} text-pink-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
  </svg>
)

const relationshipOptions = ['family', 'friend', 'colleague', 'partner', 'other']

export default function PersonalEventsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [events, setEvents] = useState<PersonalEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [showRecorder, setShowRecorder] = useState(false)
  const [showAIPrompt, setShowAIPrompt] = useState(false)

  const [formData, setFormData] = useState({
    event_type: 'birthday' as PersonalEvent['event_type'],
    person_name: '',
    relationship: '',
    event_date: '',
    year_known: true,
    notes: '',
    gift_ideas: '',
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) fetchEvents()
  }, [user])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/personal-events')
      const data = await response.json()

      // Calculate days until
      const today = new Date()
      const eventsWithDays = (data.events || []).map((event: PersonalEvent) => {
        const eventDate = parseISO(event.event_date)
        let thisYearDate = setYear(eventDate, today.getFullYear())
        if (isBefore(thisYearDate, today)) {
          thisYearDate = setYear(eventDate, today.getFullYear() + 1)
        }
        const daysUntil = differenceInDays(thisYearDate, today)

        let age: number | undefined
        if (event.year_known && event.event_type === 'birthday') {
          const birthYear = eventDate.getFullYear()
          age = today.getFullYear() - birthYear
          if (daysUntil > 0) age -= 1
        }

        return { ...event, daysUntil, age }
      })

      eventsWithDays.sort((a: PersonalEvent, b: PersonalEvent) => (a.daysUntil || 0) - (b.daysUntil || 0))
      setEvents(eventsWithDays)
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch('/api/personal-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          gift_ideas: formData.gift_ideas ? formData.gift_ideas.split(',').map(s => s.trim()) : null,
          user_id: user?.id,
        }),
      })
      setShowAddModal(false)
      setFormData({
        event_type: 'birthday',
        person_name: '',
        relationship: '',
        event_date: '',
        year_known: true,
        notes: '',
        gift_ideas: '',
      })
      fetchEvents()
    } catch (error) {
      console.error('Failed to add event:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return
    try {
      await fetch(`/api/personal-events?id=${id}`, { method: 'DELETE' })
      fetchEvents()
    } catch (error) {
      console.error('Failed to delete event:', error)
    }
  }

  const formatDaysUntil = (days: number): string => {
    if (days === 0) return 'Today!'
    if (days === 1) return 'Tomorrow'
    if (days <= 7) return `In ${days} days`
    if (days <= 30) return `In ${Math.ceil(days / 7)} weeks`
    return `In ${Math.ceil(days / 30)} months`
  }

  const filteredEvents = events.filter(e => {
    if (filter === 'all') return true
    if (filter === 'upcoming') return e.daysUntil !== undefined && e.daysUntil <= 30
    return e.event_type === filter
  })

  if (authLoading || isLoading) {
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
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black">Personal Events</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRecorder(true)}
              className="flex items-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors"
              title="Record personal event"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span className="hidden sm:inline">Record</span>
            </button>
            <button
              onClick={() => setShowAIPrompt(true)}
              className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors"
              title="Ask AI to add event"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">Ask AI</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 px-3 sm:px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="hidden sm:inline">Add Event</span>
            </button>
          </div>
        </div>
        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'upcoming', 'birthday', 'anniversary', 'holiday', 'other'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap transition-colors ${
                filter === f ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {f === 'all' ? 'All Events' : f === 'upcoming' ? 'Next 30 Days' : f}
            </button>
          ))}
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className={`bg-white/5 rounded-xl p-5 border transition-all hover:bg-white/10 ${
                event.daysUntil === 0
                  ? 'border-purple-500/50 bg-gradient-to-r from-purple-500/10 to-pink-500/10'
                  : event.daysUntil! <= 7
                  ? 'border-amber-500/30'
                  : 'border-white/10'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <EventIcon type={event.event_type} className="w-8 h-8" />
                  <div>
                    <h3 className="font-semibold text-lg">{event.person_name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {event.relationship && (
                        <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-400 capitalize">
                          {event.relationship}
                        </span>
                      )}
                      <span className="text-sm text-gray-400">
                        {format(parseISO(event.event_date), event.year_known ? 'MMMM d, yyyy' : 'MMMM d')}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <span className={`text-sm font-medium ${event.daysUntil === 0 ? 'text-purple-400' : 'text-gray-300'}`}>
                        {formatDaysUntil(event.daysUntil!)}
                      </span>
                      {event.age !== undefined && (
                        <span className="text-sm text-gray-500">Turning {event.age + 1}</span>
                      )}
                    </div>
                    {event.notes && (
                      <p className="text-sm text-gray-400 mt-2">{event.notes}</p>
                    )}
                    {event.gift_ideas && event.gift_ideas.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {event.gift_ideas.map((idea, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-pink-500/20 text-pink-400">
                            <GiftIcon className="w-3 h-3" /> {idea}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="text-gray-400 hover:text-red-400"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {filteredEvents.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className="flex justify-center mb-4">
                <EventIcon type="birthday" className="w-12 h-12" />
              </div>
              <p>No events found. Add your first personal event!</p>
            </div>
          )}
        </div>

      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4 border border-white/10 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add Personal Event</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Event Type</label>
                <select
                  value={formData.event_type}
                  onChange={(e) => setFormData(d => ({ ...d, event_type: e.target.value as PersonalEvent['event_type'] }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                >
                  <option value="birthday">Birthday</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="holiday">Holiday</option>
                  <option value="memorial">Memorial</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Person Name</label>
                <input
                  type="text"
                  required
                  value={formData.person_name}
                  onChange={(e) => setFormData(d => ({ ...d, person_name: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                  placeholder="e.g., Mom, John Smith"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Relationship</label>
                <select
                  value={formData.relationship}
                  onChange={(e) => setFormData(d => ({ ...d, relationship: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                >
                  <option value="">Select...</option>
                  {relationshipOptions.map(r => (
                    <option key={r} value={r} className="capitalize">{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.event_date}
                  onChange={(e) => setFormData(d => ({ ...d, event_date: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="year_known"
                  checked={formData.year_known}
                  onChange={(e) => setFormData(d => ({ ...d, year_known: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="year_known" className="text-sm text-gray-400">Year is known (for age calculation)</label>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(d => ({ ...d, notes: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 h-20"
                  placeholder="Any notes..."
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Gift Ideas (comma separated)</label>
                <input
                  type="text"
                  value={formData.gift_ideas}
                  onChange={(e) => setFormData(d => ({ ...d, gift_ideas: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                  placeholder="e.g., Books, Flowers, Gift card"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-white/5 py-2 rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-purple-500 py-2 rounded-lg">
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audio Recorder Modal */}
      {showRecorder && (
        <AudioRecorder
          onClose={() => setShowRecorder(false)}
          onRecordingComplete={fetchEvents}
          context="personal"
          contextHint="Describe a personal event, anniversary, or important date"
        />
      )}

      {/* AI Prompt Modal */}
      {showAIPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add Personal Event with AI</h2>
              <button
                onClick={() => setShowAIPrompt(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault()
              const formElement = e.target as HTMLFormElement
              const input = (formElement.elements.namedItem('aiInput') as HTMLInputElement).value

              // TODO: Send to AI service to parse and create event
              console.log('AI Input:', input)
              setShowAIPrompt(false)
              fetchEvents()
            }}>
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">
                  Describe the personal event in natural language
                </label>
                <textarea
                  name="aiInput"
                  placeholder="e.g., 'My mom's birthday is March 15th, she loves flowers' or 'Our anniversary is June 10th, 2015'"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  The AI will automatically extract the person, date, and event type
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAIPrompt(false)}
                  className="flex-1 bg-white/5 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-500 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
