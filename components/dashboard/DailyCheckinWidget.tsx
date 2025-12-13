'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'

interface DailyCheckin {
  id: string
  checkin_type: string
  mood_score: number | null
  energy_level: number | null
  stress_level: number | null
  ai_response: string | null
  created_at: string
}

// Mood icons (sad to happy)
const MoodIcon = ({ level, className = "w-6 h-6" }: { level: number; className?: string }) => {
  const colors = ['text-red-400', 'text-orange-400', 'text-yellow-400', 'text-lime-400', 'text-green-400']
  return (
    <svg className={`${className} ${colors[level - 1]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {level <= 2 ? (
        // Sad face
        <>
          <circle cx="12" cy="12" r="10" strokeWidth={2} />
          <path strokeLinecap="round" d="M8 9h.01M16 9h.01" strokeWidth={3} />
          <path strokeLinecap="round" d="M8 16s1.5-2 4-2 4 2 4 2" strokeWidth={2} />
        </>
      ) : level === 3 ? (
        // Neutral face
        <>
          <circle cx="12" cy="12" r="10" strokeWidth={2} />
          <path strokeLinecap="round" d="M8 9h.01M16 9h.01" strokeWidth={3} />
          <path strokeLinecap="round" d="M8 15h8" strokeWidth={2} />
        </>
      ) : (
        // Happy face
        <>
          <circle cx="12" cy="12" r="10" strokeWidth={2} />
          <path strokeLinecap="round" d="M8 9h.01M16 9h.01" strokeWidth={3} />
          <path strokeLinecap="round" d="M8 14s1.5 2 4 2 4-2 4-2" strokeWidth={2} />
        </>
      )}
    </svg>
  )
}

// Energy icons
const EnergyIcon = ({ level, className = "w-6 h-6" }: { level: number; className?: string }) => {
  const colors = ['text-gray-400', 'text-blue-400', 'text-cyan-400', 'text-yellow-400', 'text-orange-400']
  return (
    <svg className={`${className} ${colors[level - 1]}`} fill="currentColor" viewBox="0 0 24 24">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  )
}

// Stress icons
const StressIcon = ({ level, className = "w-6 h-6" }: { level: number; className?: string }) => {
  const color = level <= 2 ? 'text-green-400' : level === 3 ? 'text-yellow-400' : 'text-red-400'
  return (
    <svg className={`${className} ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

export function DailyCheckinWidget() {
  const [checkin, setCheckin] = useState<DailyCheckin | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showQuickCheckin, setShowQuickCheckin] = useState(false)
  const [quickMood, setQuickMood] = useState<number | null>(null)

  useEffect(() => {
    fetchTodayCheckin()
  }, [])

  const fetchTodayCheckin = async () => {
    try {
      const response = await fetch('/api/checkin')
      const data = await response.json()
      setCheckin(data.checkin)
    } catch (error) {
      console.error('Failed to fetch checkin:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickCheckin = async (mood: number) => {
    setQuickMood(mood)
    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkin_type: 'morning',
          checkin_date: format(new Date(), 'yyyy-MM-dd'),
          mood_score: mood,
          generateResponse: true,
        }),
      })
      const data = await response.json()
      setCheckin(data.checkin)
      setShowQuickCheckin(false)
    } catch (error) {
      console.error('Failed to submit checkin:', error)
    }
  }

  const getTimeOfDay = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'morning'
    if (hour < 17) return 'afternoon'
    return 'evening'
  }

  if (isLoading) {
    return (
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10 animate-pulse">
        <div className="h-6 bg-white/10 rounded w-32 mb-4"></div>
        <div className="h-20 bg-white/10 rounded-lg"></div>
      </div>
    )
  }

  if (checkin) {
    return (
      <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-2xl p-6 border border-purple-700/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Today's Check-in</h3>
          <Link href="/checkin" className="text-sm text-purple-400 hover:text-purple-300">
            Details →
          </Link>
        </div>

        <div className="flex items-center gap-6 mb-4">
          {checkin.mood_score && (
            <div className="text-center">
              <div className="mb-1 flex justify-center"><MoodIcon level={checkin.mood_score} className="w-8 h-8" /></div>
              <div className="text-xs text-gray-400">Mood</div>
            </div>
          )}
          {checkin.energy_level && (
            <div className="text-center">
              <div className="mb-1 flex justify-center"><EnergyIcon level={checkin.energy_level} className="w-8 h-8" /></div>
              <div className="text-xs text-gray-400">Energy</div>
            </div>
          )}
          {checkin.stress_level && (
            <div className="text-center">
              <div className="mb-1 flex justify-center"><StressIcon level={checkin.stress_level} className="w-8 h-8" /></div>
              <div className="text-xs text-gray-400">Stress</div>
            </div>
          )}
        </div>

        {checkin.ai_response && (
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-sm text-gray-300 italic">"{checkin.ai_response}"</p>
          </div>
        )}
      </div>
    )
  }

  if (showQuickCheckin) {
    return (
      <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-2xl p-6 border border-purple-700/30">
        <h3 className="font-semibold text-white mb-4">How are you feeling?</h3>
        <div className="flex justify-center gap-3">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              onClick={() => handleQuickCheckin(level)}
              disabled={quickMood !== null}
              className={`p-3 rounded-lg transition-all hover:scale-110 ${
                quickMood === level
                  ? 'bg-purple-500/30 scale-110'
                  : 'hover:bg-white/10'
              } ${quickMood !== null && quickMood !== level ? 'opacity-50' : ''}`}
            >
              <MoodIcon level={level} className="w-8 h-8" />
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowQuickCheckin(false)}
          className="mt-4 text-sm text-gray-400 hover:text-white w-full text-center"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-2xl p-6 border border-purple-700/30">
      <h3 className="font-semibold text-white mb-2">Daily Check-in</h3>
      <p className="text-gray-400 text-sm mb-4">
        Good {getTimeOfDay()}! Take a moment to check in with yourself.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => setShowQuickCheckin(true)}
          className="flex-1 bg-purple-500/20 text-purple-400 py-2 rounded-lg hover:bg-purple-500/30 transition-colors"
        >
          Quick Check-in
        </button>
        <Link
          href="/checkin"
          className="flex-1 bg-white/5 text-white py-2 rounded-lg hover:bg-white/10 transition-colors text-center"
        >
          Full Check-in
        </Link>
      </div>
    </div>
  )
}
