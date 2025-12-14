'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { format, subDays } from 'date-fns'
import DashboardLayout from '@/components/DashboardLayout'
import AudioRecorder from '@/components/AudioRecorder'

interface DailyCheckin {
  id: string
  checkin_type: string
  checkin_date: string
  mood_score: number | null
  energy_level: number | null
  stress_level: number | null
  sleep_quality: number | null
  gratitude_items: string[] | null
  wins: string[] | null
  challenges: string[] | null
  tomorrow_priorities: string[] | null
  journal_entry: string | null
  ai_response: string | null
}

const moodLabels = ['Very Low', 'Low', 'Neutral', 'Good', 'Great']
const energyLabels = ['Exhausted', 'Tired', 'Okay', 'Energetic', 'Supercharged']
const stressLabels = ['Calm', 'Relaxed', 'Mild', 'Stressed', 'Overwhelmed']
const sleepLabels = ['Terrible', 'Poor', 'Fair', 'Good', 'Excellent']

// Icon components
const MoodIcon = ({ level, className = "w-6 h-6" }: { level: number; className?: string }) => {
  const colors = ['text-red-400', 'text-orange-400', 'text-yellow-400', 'text-lime-400', 'text-green-400']
  return (
    <svg className={`${className} ${colors[level - 1]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {level <= 2 ? (
        <><circle cx="12" cy="12" r="10" strokeWidth={2} /><path strokeLinecap="round" d="M8 9h.01M16 9h.01" strokeWidth={3} /><path strokeLinecap="round" d="M8 16s1.5-2 4-2 4 2 4 2" strokeWidth={2} /></>
      ) : level === 3 ? (
        <><circle cx="12" cy="12" r="10" strokeWidth={2} /><path strokeLinecap="round" d="M8 9h.01M16 9h.01" strokeWidth={3} /><path strokeLinecap="round" d="M8 15h8" strokeWidth={2} /></>
      ) : (
        <><circle cx="12" cy="12" r="10" strokeWidth={2} /><path strokeLinecap="round" d="M8 9h.01M16 9h.01" strokeWidth={3} /><path strokeLinecap="round" d="M8 14s1.5 2 4 2 4-2 4-2" strokeWidth={2} /></>
      )}
    </svg>
  )
}

const EnergyIcon = ({ level, className = "w-6 h-6" }: { level: number; className?: string }) => {
  const colors = ['text-gray-400', 'text-blue-400', 'text-cyan-400', 'text-yellow-400', 'text-orange-400']
  return (
    <svg className={`${className} ${colors[level - 1]}`} fill="currentColor" viewBox="0 0 24 24">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  )
}

const StressIcon = ({ level, className = "w-6 h-6" }: { level: number; className?: string }) => {
  const colors = ['text-green-400', 'text-lime-400', 'text-yellow-400', 'text-orange-400', 'text-red-400']
  return (
    <svg className={`${className} ${colors[level - 1]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      {level <= 2 ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      )}
    </svg>
  )
}

const SleepIcon = ({ level, className = "w-6 h-6" }: { level: number; className?: string }) => {
  const colors = ['text-red-400', 'text-orange-400', 'text-yellow-400', 'text-blue-400', 'text-purple-400']
  return (
    <svg className={`${className} ${colors[level - 1]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  )
}

const AIIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={`${className} text-purple-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

export default function CheckinPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<'checkin' | 'history'>('checkin')
  const [history, setHistory] = useState<DailyCheckin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [todayCheckin, setTodayCheckin] = useState<DailyCheckin | null>(null)
  const [showRecorder, setShowRecorder] = useState(false)
  const [showAIPrompt, setShowAIPrompt] = useState(false)

  const [formData, setFormData] = useState({
    mood_score: null as number | null,
    energy_level: null as number | null,
    stress_level: null as number | null,
    sleep_quality: null as number | null,
    gratitude: '',
    wins: '',
    challenges: '',
    priorities: '',
    journal_entry: '',
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      const [checkinRes, historyRes] = await Promise.all([
        fetch('/api/checkin'),
        fetch('/api/checkin?history=true&days=30'),
      ])
      const checkinData = await checkinRes.json()
      const historyData = await historyRes.json()

      setTodayCheckin(checkinData.checkin)
      setHistory(historyData.checkins || [])

      if (checkinData.checkin) {
        const c = checkinData.checkin
        setFormData({
          mood_score: c.mood_score,
          energy_level: c.energy_level,
          stress_level: c.stress_level,
          sleep_quality: c.sleep_quality,
          gratitude: c.gratitude_items?.join(', ') || '',
          wins: c.wins?.join(', ') || '',
          challenges: c.challenges?.join(', ') || '',
          priorities: c.tomorrow_priorities?.join(', ') || '',
          journal_entry: c.journal_entry || '',
        })
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkin_type: 'morning',
          checkin_date: format(new Date(), 'yyyy-MM-dd'),
          mood_score: formData.mood_score,
          energy_level: formData.energy_level,
          stress_level: formData.stress_level,
          sleep_quality: formData.sleep_quality,
          gratitude_items: formData.gratitude ? formData.gratitude.split(',').map(s => s.trim()).filter(Boolean) : null,
          wins: formData.wins ? formData.wins.split(',').map(s => s.trim()).filter(Boolean) : null,
          challenges: formData.challenges ? formData.challenges.split(',').map(s => s.trim()).filter(Boolean) : null,
          tomorrow_priorities: formData.priorities ? formData.priorities.split(',').map(s => s.trim()).filter(Boolean) : null,
          journal_entry: formData.journal_entry || null,
          generateResponse: true,
          user_id: user?.id,
        }),
      })
      const data = await response.json()
      setTodayCheckin(data.checkin)
      fetchData()
    } catch (error) {
      console.error('Failed to submit checkin:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const ScoreSelector = ({
    label,
    IconComponent,
    labels,
    value,
    onChange,
  }: {
    label: string
    IconComponent: React.ComponentType<{ level: number; className?: string }>
    labels: string[]
    value: number | null
    onChange: (val: number) => void
  }) => (
    <div className="mb-6">
      <label className="block text-sm text-gray-400 mb-3">{label}</label>
      <div className="flex justify-between gap-2">
        {labels.map((labelText, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onChange(index + 1)}
            className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
              value === index + 1
                ? 'bg-purple-500/30 scale-105 ring-2 ring-purple-500'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <IconComponent level={index + 1} className="w-7 h-7" />
            <span className="text-xs text-gray-400">{labelText}</span>
          </button>
        ))}
      </div>
    </div>
  )

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
      <div className="max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black">Daily Check-in</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRecorder(true)}
              className="flex items-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors"
              title="Record check-in"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span className="hidden sm:inline">Record</span>
            </button>
            <button
              onClick={() => setShowAIPrompt(true)}
              className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors"
              title="Ask AI for check-in"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('checkin')}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              activeTab === 'checkin' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Today's Check-in
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              activeTab === 'history' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            History
          </button>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 pb-8">
        {activeTab === 'checkin' && (
          <div className="space-y-6">
            {/* AI Response */}
            {todayCheckin?.ai_response && (
              <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl p-5 border border-purple-500/30">
                <div className="flex items-start gap-3">
                  <AIIcon className="w-7 h-7" />
                  <div>
                    <p className="text-gray-300 italic">"{todayCheckin.ai_response}"</p>
                    <p className="text-xs text-gray-500 mt-2">AI response from your check-in</p>
                  </div>
                </div>
              </div>
            )}

            {/* Score Selectors */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <ScoreSelector
                label="How's your mood?"
                IconComponent={MoodIcon}
                labels={moodLabels}
                value={formData.mood_score}
                onChange={(val) => setFormData(d => ({ ...d, mood_score: val }))}
              />

              <ScoreSelector
                label="Energy level?"
                IconComponent={EnergyIcon}
                labels={energyLabels}
                value={formData.energy_level}
                onChange={(val) => setFormData(d => ({ ...d, energy_level: val }))}
              />

              <ScoreSelector
                label="Stress level?"
                IconComponent={StressIcon}
                labels={stressLabels}
                value={formData.stress_level}
                onChange={(val) => setFormData(d => ({ ...d, stress_level: val }))}
              />

              <ScoreSelector
                label="Sleep quality?"
                IconComponent={SleepIcon}
                labels={sleepLabels}
                value={formData.sleep_quality}
                onChange={(val) => setFormData(d => ({ ...d, sleep_quality: val }))}
              />
            </div>

            {/* Text Inputs */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">What are you grateful for? (comma separated)</label>
                <input
                  type="text"
                  value={formData.gratitude}
                  onChange={(e) => setFormData(d => ({ ...d, gratitude: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900"
                  placeholder="e.g., Family, Health, Good weather"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Today's wins (comma separated)</label>
                <input
                  type="text"
                  value={formData.wins}
                  onChange={(e) => setFormData(d => ({ ...d, wins: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900"
                  placeholder="e.g., Finished project, Good workout"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Challenges (comma separated)</label>
                <input
                  type="text"
                  value={formData.challenges}
                  onChange={(e) => setFormData(d => ({ ...d, challenges: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900"
                  placeholder="e.g., Tight deadline, Difficult meeting"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Tomorrow's priorities (comma separated)</label>
                <input
                  type="text"
                  value={formData.priorities}
                  onChange={(e) => setFormData(d => ({ ...d, priorities: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900"
                  placeholder="e.g., Prepare presentation, Call client"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Journal entry</label>
                <textarea
                  value={formData.journal_entry}
                  onChange={(e) => setFormData(d => ({ ...d, journal_entry: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 h-32 text-gray-900"
                  placeholder="Write your thoughts..."
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 py-3 rounded-xl font-medium disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : todayCheckin ? 'Update Check-in' : 'Save Check-in'}
            </button>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {history.map((checkin) => (
              <div key={checkin.id} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">{format(new Date(checkin.checkin_date), 'EEEE, MMM d')}</span>
                  <span className="text-xs text-gray-500 capitalize">{checkin.checkin_type}</span>
                </div>
                <div className="flex gap-6 mb-3">
                  {checkin.mood_score && (
                    <div className="text-center">
                      <MoodIcon level={checkin.mood_score} className="w-7 h-7 mx-auto" />
                      <div className="text-xs text-gray-400 mt-1">Mood</div>
                    </div>
                  )}
                  {checkin.energy_level && (
                    <div className="text-center">
                      <EnergyIcon level={checkin.energy_level} className="w-7 h-7 mx-auto" />
                      <div className="text-xs text-gray-400 mt-1">Energy</div>
                    </div>
                  )}
                  {checkin.stress_level && (
                    <div className="text-center">
                      <StressIcon level={checkin.stress_level} className="w-7 h-7 mx-auto" />
                      <div className="text-xs text-gray-400 mt-1">Stress</div>
                    </div>
                  )}
                  {checkin.sleep_quality && (
                    <div className="text-center">
                      <SleepIcon level={checkin.sleep_quality} className="w-7 h-7 mx-auto" />
                      <div className="text-xs text-gray-400 mt-1">Sleep</div>
                    </div>
                  )}
                </div>
                {checkin.journal_entry && (
                  <p className="text-sm text-gray-400 mt-2 line-clamp-2">{checkin.journal_entry}</p>
                )}
              </div>
            ))}

            {history.length === 0 && (
              <div className="text-center py-12 text-gray-600">
                <div className="flex justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <p>No check-in history yet</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Audio Recorder Modal */}
      {showRecorder && (
        <AudioRecorder
          onClose={() => setShowRecorder(false)}
          onRecordingComplete={fetchData}
          context="checkin"
          contextHint="Describe how you're feeling today and what you want to track"
        />
      )}

      {/* AI Prompt Modal */}
      {showAIPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 border border-gray-200 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Daily Check-in with AI</h2>
              <button
                onClick={() => setShowAIPrompt(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
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

              // TODO: Send to AI service to parse and create check-in
              console.log('AI Input:', input)
              setShowAIPrompt(false)
              fetchData()
            }}>
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">
                  Describe how you're feeling today
                </label>
                <textarea
                  name="aiInput"
                  placeholder="e.g., 'Feeling energetic and optimistic today, slept well, ready to tackle my presentation' or 'Tired and stressed, lots of work pressure'"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  The AI will automatically track your mood, energy, stress, and more
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAIPrompt(false)}
                  className="flex-1 bg-gray-100 py-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-500 py-2 rounded-lg hover:bg-purple-600 transition-colors text-white"
                >
                  Save Check-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
