'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

const mockFamilyReminders = [
  { id: '1', person: 'Mum', event: 'Birthday', date: '2024-02-14', type: 'birthday', notes: 'Buy flowers and chocolate' },
  { id: '2', person: 'Dad', event: 'Anniversary', date: '2024-03-20', type: 'anniversary', notes: 'Book dinner reservation' },
  { id: '3', person: 'Sister', event: 'Graduation', date: '2024-05-15', type: 'special', notes: 'Get gift card' },
  { id: '4', person: 'Brother', event: 'Birthday', date: '2024-06-22', type: 'birthday', notes: 'He wants new headphones' },
  { id: '5', person: 'Grandma', event: 'Visit', date: '2024-01-28', type: 'special', notes: 'Bring her favorite cookies' },
]

const typeColors: Record<string, string> = {
  birthday: 'bg-pink-100 text-pink-600 border-pink-200',
  anniversary: 'bg-purple-100 text-purple-600 border-purple-200',
  special: 'bg-blue-100 text-blue-600 border-blue-200',
}

const typeIcons: Record<string, JSX.Element> = {
  birthday: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
    </svg>
  ),
  anniversary: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  special: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
}

export default function FamilyRemindersPage() {
  const [showModal, setShowModal] = useState(false)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const getDaysUntil = (dateStr: string) => {
    const today = new Date()
    const eventDate = new Date(dateStr)
    const diffTime = eventDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return 'Passed'
    if (diffDays === 0) return 'Today!'
    if (diffDays === 1) return 'Tomorrow'
    return `${diffDays} days`
  }

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Family Reminders</h1>
            <p className="text-gray-500 mt-1">Never miss birthdays, anniversaries, and special moments</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#A855F7] hover:bg-[#9333EA] px-4 py-2.5 rounded-full font-semibold transition-all inline-flex items-center gap-2 text-white"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Reminder
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-pink-50 rounded-xl p-4 border border-pink-100">
            <div className="text-pink-600 text-2xl font-bold">3</div>
            <div className="text-pink-600 text-sm">Birthdays</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <div className="text-purple-600 text-2xl font-bold">1</div>
            <div className="text-purple-600 text-sm">Anniversaries</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="text-blue-600 text-2xl font-bold">2</div>
            <div className="text-blue-600 text-sm">Special Events</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
            <div className="text-amber-600 text-2xl font-bold">1</div>
            <div className="text-amber-600 text-sm">Coming Soon</div>
          </div>
        </div>

        {/* Upcoming Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h2>
          <div className="space-y-3">
            {mockFamilyReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${typeColors[reminder.type]}`}>
                      {typeIcons[reminder.type]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{reminder.person}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${typeColors[reminder.type]}`}>
                          {reminder.event}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{reminder.notes}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(reminder.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
                      {getDaysUntil(reminder.date)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button className="flex items-center gap-2 px-4 py-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-colors text-sm font-medium text-gray-700">
              <svg className="w-5 h-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
              </svg>
              Add Birthday
            </button>
            <button className="flex items-center gap-2 px-4 py-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-colors text-sm font-medium text-gray-700">
              <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Add Anniversary
            </button>
            <button className="flex items-center gap-2 px-4 py-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-colors text-sm font-medium text-gray-700">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              Gift Ideas
            </button>
            <button className="flex items-center gap-2 px-4 py-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-colors text-sm font-medium text-gray-700">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Import Contacts
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
