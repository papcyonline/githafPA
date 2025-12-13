'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { format, parseISO, differenceInDays, isBefore, isToday } from 'date-fns'
import DashboardLayout from '@/components/DashboardLayout'
import AudioRecorder from '@/components/AudioRecorder'

interface LifeTask {
  id: string
  category: 'health' | 'finance' | 'home' | 'vehicle' | 'documents' | 'insurance' | 'subscriptions' | 'other'
  title: string
  description: string | null
  due_date: string | null
  recurrence_rule: string | null
  last_completed_at: string | null
  next_due_at: string | null
  reminder_days_before: number[]
  is_active: boolean
  daysUntilDue?: number
  isOverdue?: boolean
}

const CategoryIcon = ({ category, className = "w-5 h-5" }: { category: string; className?: string }) => {
  const icons: Record<string, JSX.Element> = {
    health: (
      <svg className={`${className} text-red-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    finance: (
      <svg className={`${className} text-green-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    home: (
      <svg className={`${className} text-blue-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    vehicle: (
      <svg className={`${className} text-orange-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
    documents: (
      <svg className={`${className} text-purple-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    insurance: (
      <svg className={`${className} text-cyan-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    subscriptions: (
      <svg className={`${className} text-pink-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    other: (
      <svg className={`${className} text-gray-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  }
  return icons[category] || icons.other
}

const CATEGORIES: Record<string, { label: string; color: string }> = {
  health: { label: 'Health', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  finance: { label: 'Finance', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  home: { label: 'Home', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  vehicle: { label: 'Vehicle', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  documents: { label: 'Documents', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  insurance: { label: 'Insurance', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  subscriptions: { label: 'Subscriptions', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  other: { label: 'Other', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
}

const RECURRENCE_OPTIONS = [
  { value: '', label: 'One-time' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'biannual', label: 'Every 6 months' },
  { value: 'yearly', label: 'Yearly' },
]

export default function LifeTasksPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [tasks, setTasks] = useState<LifeTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [showRecorder, setShowRecorder] = useState(false)
  const [showAIPrompt, setShowAIPrompt] = useState(false)

  const [formData, setFormData] = useState({
    category: 'health' as LifeTask['category'],
    title: '',
    description: '',
    due_date: '',
    recurrence_rule: '',
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) fetchTasks()
  }, [user])

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/life-tasks')
      const data = await response.json()

      // Calculate status
      const today = new Date()
      const tasksWithStatus = (data.tasks || []).map((task: LifeTask) => {
        if (!task.next_due_at) return { ...task, daysUntilDue: undefined, isOverdue: false }

        const dueDate = parseISO(task.next_due_at)
        const daysUntilDue = differenceInDays(dueDate, today)
        const isOverdue = isBefore(dueDate, today) && !isToday(dueDate)

        return { ...task, daysUntilDue, isOverdue }
      })

      tasksWithStatus.sort((a: LifeTask, b: LifeTask) => {
        if (a.isOverdue && !b.isOverdue) return -1
        if (!a.isOverdue && b.isOverdue) return 1
        return (a.daysUntilDue || 999) - (b.daysUntilDue || 999)
      })

      setTasks(tasksWithStatus)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch('/api/life-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          next_due_at: formData.due_date || null,
          recurrence_rule: formData.recurrence_rule || null,
          is_active: true,
          user_id: user?.id,
        }),
      })
      setShowAddModal(false)
      setFormData({
        category: 'health',
        title: '',
        description: '',
        due_date: '',
        recurrence_rule: '',
      })
      fetchTasks()
    } catch (error) {
      console.error('Failed to add task:', error)
    }
  }

  const handleComplete = async (id: string) => {
    try {
      await fetch('/api/life-tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'complete' }),
      })
      fetchTasks()
    } catch (error) {
      console.error('Failed to complete task:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return
    try {
      await fetch(`/api/life-tasks?id=${id}`, { method: 'DELETE' })
      fetchTasks()
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const formatDaysUntil = (days: number | undefined): string => {
    if (days === undefined) return 'No due date'
    if (days < 0) return `${Math.abs(days)} days overdue`
    if (days === 0) return 'Due today'
    if (days === 1) return 'Due tomorrow'
    if (days <= 7) return `Due in ${days} days`
    if (days <= 30) return `Due in ${Math.ceil(days / 7)} weeks`
    return `Due in ${Math.ceil(days / 30)} months`
  }

  const filteredTasks = tasks.filter(t => {
    if (filter === 'all') return true
    if (filter === 'overdue') return t.isOverdue
    if (filter === 'upcoming') return t.daysUntilDue !== undefined && t.daysUntilDue >= 0 && t.daysUntilDue <= 30
    return t.category === filter
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
          <h1 className="text-2xl font-black">Life Tasks</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRecorder(true)}
              className="flex items-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors"
              title="Record life task"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span className="hidden sm:inline">Record</span>
            </button>
            <button
              onClick={() => setShowAIPrompt(true)}
              className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors"
              title="Ask AI to add task"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">Ask AI</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-green-500 px-3 sm:px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="hidden sm:inline">Add Task</span>
            </button>
          </div>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20 text-center">
            <div className="text-2xl font-bold text-red-400">{tasks.filter(t => t.isOverdue).length}</div>
            <div className="text-xs text-gray-400">Overdue</div>
          </div>
          <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20 text-center">
            <div className="text-2xl font-bold text-amber-400">
              {tasks.filter(t => t.daysUntilDue !== undefined && t.daysUntilDue >= 0 && t.daysUntilDue <= 7).length}
            </div>
            <div className="text-xs text-gray-400">This Week</div>
          </div>
          <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20 text-center">
            <div className="text-2xl font-bold text-green-400">{tasks.length}</div>
            <div className="text-xs text-gray-400">Total Active</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'overdue', 'upcoming', ...Object.keys(CATEGORIES)].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap transition-colors flex items-center gap-2 ${
                filter === f ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {CATEGORIES[f as keyof typeof CATEGORIES] && <CategoryIcon category={f} className="w-5 h-5" />}
              {f === 'all' ? 'All Tasks' : f === 'overdue' ? 'Overdue' : f === 'upcoming' ? 'Next 30 Days' : CATEGORIES[f as keyof typeof CATEGORIES]?.label}
            </button>
          ))}
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const cat = CATEGORIES[task.category]
            return (
              <div
                key={task.id}
                className={`bg-white/5 rounded-xl p-4 border transition-all hover:bg-white/10 ${
                  task.isOverdue ? 'border-red-500/50' : 'border-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <CategoryIcon category={task.category} className="w-7 h-7" />
                    <div>
                      <h3 className="font-medium">{task.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded border ${cat.color}`}>
                          {cat.label}
                        </span>
                        {task.recurrence_rule && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {task.recurrence_rule}
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-400 mt-2">{task.description}</p>
                      )}
                      <div className={`text-sm mt-2 ${task.isOverdue ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
                        {formatDaysUntil(task.daysUntilDue)}
                        {task.next_due_at && (
                          <span className="text-gray-500 ml-2">
                            ({format(parseISO(task.next_due_at), 'MMM d, yyyy')})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleComplete(task.id)}
                      className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"
                      title="Mark complete"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/5"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {filteredTasks.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className="flex justify-center mb-4">
                <CategoryIcon category="other" className="w-12 h-12" />
              </div>
              <p>No tasks found. Add your first life task!</p>
            </div>
          )}
        </div>

      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4 border border-white/10">
            <h2 className="text-xl font-bold mb-4">Add Life Task</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(d => ({ ...d, category: e.target.value as LifeTask['category'] }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                >
                  {Object.entries(CATEGORIES).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(d => ({ ...d, title: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                  placeholder="e.g., Annual checkup, Car insurance renewal"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(d => ({ ...d, description: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 h-20"
                  placeholder="Optional details..."
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData(d => ({ ...d, due_date: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Recurrence</label>
                <select
                  value={formData.recurrence_rule}
                  onChange={(e) => setFormData(d => ({ ...d, recurrence_rule: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                >
                  {RECURRENCE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-white/5 py-2 rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-purple-500 py-2 rounded-lg">
                  Add Task
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
          onRecordingComplete={fetchTasks}
          context="life-tasks"
          contextHint="Describe a life task like renewing insurance, scheduling appointments, etc."
        />
      )}

      {/* AI Prompt Modal */}
      {showAIPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add Life Task with AI</h2>
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

              // TODO: Send to AI service to parse and create task
              console.log('AI Input:', input)
              setShowAIPrompt(false)
              fetchTasks()
            }}>
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">
                  Describe the life task in natural language
                </label>
                <textarea
                  name="aiInput"
                  placeholder="e.g., 'Renew car insurance by December 31st, happens yearly' or 'Schedule dentist appointment next month'"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  The AI will automatically extract the category, due date, and recurrence
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
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
