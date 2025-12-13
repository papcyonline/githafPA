'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { parseAssignmentCommand } from '@/lib/smart-assignments.service'
import { notificationsService } from '@/lib/notifications.service'

interface SmartAssignmentWidgetProps {
  onClose?: () => void
  initialQuery?: string
}

export function SmartAssignmentWidget({ onClose, initialQuery = '' }: SmartAssignmentWidgetProps) {
  const { user } = useAuth()
  const [query, setQuery] = useState(initialQuery)
  const [saveAs, setSaveAs] = useState<'note' | 'reminder' | 'task'>('note')
  const [reminderDate, setReminderDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )
  const [reminderTime, setReminderTime] = useState('09:00')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    title?: string
    preview?: string
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim() || !user) return

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/smart-assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          saveAs,
          reminderDate: saveAs === 'reminder' ? reminderDate : undefined,
          reminderTime: saveAs === 'reminder' ? reminderTime : undefined,
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult({
          success: true,
          message: data.message,
          title: data.result?.title,
          preview: data.result?.preview,
        })

        // Send notification
        if (notificationsService.getPermission() === 'granted') {
          await notificationsService.showNotification({
            title: 'Research Complete!',
            body: `"${data.result?.title}" saved to ${saveAs}s`,
            tag: 'assignment-complete',
          })
        }
      } else {
        setResult({
          success: false,
          message: data.error || 'Something went wrong',
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to complete assignment',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const exampleQueries = [
    'Find me the cheapest hotels in Dubai',
    'Best restaurants in New York City',
    'Compare iPhone vs Samsung prices',
    'Top tourist attractions in Paris',
    'Healthy meal prep ideas for the week',
  ]

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-white">Smart Assignment</h3>
            <p className="text-sm text-gray-400">Ask me to research anything</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Query Input */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            What would you like me to research?
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Find me the cheapest hotels in Dubai..."
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 resize-none"
            rows={3}
            disabled={isLoading}
          />
        </div>

        {/* Example Queries */}
        {!query && (
          <div className="flex flex-wrap gap-2">
            {exampleQueries.slice(0, 3).map((example, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setQuery(example)}
                className="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-gray-400 rounded-full transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        )}

        {/* Save As Options */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Save results as
          </label>
          <div className="flex gap-2">
            {(['note', 'reminder', 'task'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSaveAs(option)}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  saveAs === option
                    ? 'bg-purple-600 text-white'
                    : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                }`}
                disabled={isLoading}
              >
                <div className="flex items-center justify-center gap-2">
                  {option === 'note' && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  )}
                  {option === 'reminder' && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  )}
                  {option === 'task' && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  )}
                  <span className="capitalize">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Reminder Date/Time (only shown if reminder is selected) */}
        {saveAs === 'reminder' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Remind me on
              </label>
              <input
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                At
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                disabled={isLoading}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Researching...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Start Research</span>
            </>
          )}
        </button>
      </form>

      {/* Result */}
      {result && (
        <div className={`mt-4 p-4 rounded-xl ${
          result.success
            ? 'bg-green-500/10 border border-green-500/20'
            : 'bg-red-500/10 border border-red-500/20'
        }`}>
          <div className="flex items-start gap-3">
            {result.success ? (
              <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <div className="flex-1 min-w-0">
              <p className={`font-medium ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                {result.message}
              </p>
              {result.title && (
                <p className="text-sm text-gray-400 mt-1">
                  <span className="font-medium">Title:</span> {result.title}
                </p>
              )}
              {result.preview && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                  {result.preview}
                </p>
              )}
              {result.success && (
                <a
                  href={saveAs === 'note' ? '/notes' : saveAs === 'reminder' ? '/reminders' : '/dashboard'}
                  className="inline-block mt-3 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  View {saveAs} →
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
