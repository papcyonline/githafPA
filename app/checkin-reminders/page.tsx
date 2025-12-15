'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

const mockCheckinReminders = [
  { id: '1', person: 'Mum', lastCheckin: '2024-01-20', frequency: 'weekly', status: 'due', phone: '+1 234 567 890' },
  { id: '2', person: 'Best Friend - John', lastCheckin: '2024-01-18', frequency: 'weekly', status: 'ok', phone: '+1 234 567 891' },
  { id: '3', person: 'Grandpa', lastCheckin: '2024-01-10', frequency: 'weekly', status: 'overdue', phone: '+1 234 567 892' },
  { id: '4', person: 'Mentor - Sarah', lastCheckin: '2024-01-15', frequency: 'monthly', status: 'ok', phone: '+1 234 567 893' },
  { id: '5', person: 'Uncle Ahmed', lastCheckin: '2024-01-05', frequency: 'monthly', status: 'due', phone: '+1 234 567 894' },
]

const statusColors: Record<string, string> = {
  ok: 'bg-green-100 text-green-600 border-green-200',
  due: 'bg-amber-100 text-amber-600 border-amber-200',
  overdue: 'bg-red-100 text-red-600 border-red-200',
}

const statusLabels: Record<string, string> = {
  ok: 'Up to date',
  due: 'Check-in due',
  overdue: 'Overdue',
}

export default function CheckinRemindersPage() {
  const [showModal, setShowModal] = useState(false)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getDaysSince = (dateStr: string) => {
    const today = new Date()
    const lastDate = new Date(dateStr)
    const diffTime = today.getTime() - lastDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    return `${diffDays} days ago`
  }

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Check-in Reminders</h1>
            <p className="text-gray-500 mt-1">Stay connected with the people who matter most</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#A855F7] hover:bg-[#9333EA] px-4 py-2.5 rounded-full font-semibold transition-all inline-flex items-center gap-2 text-white"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Person
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-red-50 rounded-xl p-4 border border-red-100">
            <div className="text-red-600 text-2xl font-bold">1</div>
            <div className="text-red-600 text-sm">Overdue</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
            <div className="text-amber-600 text-2xl font-bold">2</div>
            <div className="text-amber-600 text-sm">Due Soon</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <div className="text-green-600 text-2xl font-bold">2</div>
            <div className="text-green-600 text-sm">Up to Date</div>
          </div>
        </div>

        {/* People List */}
        <div className="space-y-3">
          {mockCheckinReminders.map((person) => (
            <div
              key={person.id}
              className={`bg-white rounded-xl border p-4 hover:shadow-md transition-all ${
                person.status === 'overdue' ? 'border-red-200' : person.status === 'due' ? 'border-amber-200' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                    {person.person.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{person.person}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Last: {getDaysSince(person.lastCheckin)}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {person.frequency}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[person.status]}`}>
                    {statusLabels[person.status]}
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-green-50 rounded-lg transition-colors text-green-600" title="Call">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </button>
                    <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600" title="Message">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </button>
                    <button className="p-2 hover:bg-purple-50 rounded-lg transition-colors text-purple-600" title="Mark as done">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tips Section */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
          <h3 className="font-semibold text-gray-900 mb-3">Staying Connected Tips</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Schedule regular calls with family members</span>
            </div>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Send a quick message even when busy</span>
            </div>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Video calls can be more meaningful</span>
            </div>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Ask about their day and listen actively</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
