'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { differenceInDays, parseISO, setYear, isBefore } from 'date-fns'

interface PersonalEvent {
  id: string
  event_type: 'birthday' | 'anniversary' | 'holiday' | 'memorial' | 'other'
  person_name: string
  relationship: string | null
  event_date: string
  year_known: boolean
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

const relationshipColors: Record<string, string> = {
  family: 'bg-pink-500/20 text-pink-400',
  friend: 'bg-blue-500/20 text-blue-400',
  colleague: 'bg-green-500/20 text-green-400',
  partner: 'bg-purple-500/20 text-purple-400',
  other: 'bg-gray-500/20 text-gray-400',
}

export function PersonalEventsWidget() {
  const [events, setEvents] = useState<PersonalEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/personal-events')
      const data = await response.json()

      // Calculate days until each event
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

      // Sort by days until and filter upcoming (next 30 days)
      const upcoming = eventsWithDays
        .filter((e: PersonalEvent) => e.daysUntil !== undefined && e.daysUntil >= 0 && e.daysUntil <= 30)
        .sort((a: PersonalEvent, b: PersonalEvent) => (a.daysUntil || 0) - (b.daysUntil || 0))

      setEvents(upcoming.slice(0, 5))
    } catch (error) {
      console.error('Failed to fetch personal events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDaysUntil = (days: number): string => {
    if (days === 0) return 'Today!'
    if (days === 1) return 'Tomorrow'
    if (days <= 7) return `In ${days} days`
    return `In ${Math.ceil(days / 7)} weeks`
  }

  if (isLoading) {
    return (
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10 animate-pulse">
        <div className="h-6 bg-white/10 rounded w-40 mb-4"></div>
        <div className="space-y-3">
          <div className="h-14 bg-white/10 rounded-lg"></div>
          <div className="h-14 bg-white/10 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Upcoming Events</h3>
        <Link href="/personal" className="text-sm text-purple-400 hover:text-purple-300">
          View all →
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-500/20 flex items-center justify-center">
            <EventIcon type="birthday" className="w-6 h-6" />
          </div>
          <p className="text-gray-400 mb-4">No upcoming events</p>
          <Link
            href="/personal"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Event
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className={`p-3 rounded-lg border transition-all hover:bg-white/5 ${
                event.daysUntil === 0
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30'
                  : event.daysUntil! <= 3
                  ? 'bg-amber-500/10 border-amber-500/20'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <EventIcon type={event.event_type} className="w-7 h-7" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white truncate">{event.person_name}</span>
                    {event.relationship && (
                      <span className={`text-xs px-2 py-0.5 rounded ${relationshipColors[event.relationship] || relationshipColors.other}`}>
                        {event.relationship}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={event.daysUntil === 0 ? 'text-purple-400 font-medium' : 'text-gray-400'}>
                      {formatDaysUntil(event.daysUntil!)}
                    </span>
                    {event.age !== undefined && (
                      <span className="text-gray-500">
                        • Turning {event.age + 1}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
