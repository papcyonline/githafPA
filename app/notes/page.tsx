'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../lib/auth-context'
import { notesService, remindersService, tasksService, Note, Reminder, Task } from '../../lib/notes.service'
import FloatingAIChat from '../../components/FloatingAIChat'
import DashboardLayout from '../../components/DashboardLayout'

type TabType = 'notes' | 'reminders' | 'tasks'

export default function NotesPage() {
  const router = useRouter()
  const { user, loading: authLoading, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('notes')
  const [notes, setNotes] = useState<Note[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  // Add modals state
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)

  // Form states
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [reminderTitle, setReminderTitle] = useState('')
  const [reminderDescription, setReminderDescription] = useState('')
  const [reminderDate, setReminderDate] = useState('')
  const [reminderTime, setReminderTime] = useState('')
  const [taskTitle, setTaskTitle] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      fetchData()
    }
  }, [user, authLoading, router, activeTab])

  const fetchData = async () => {
    try {
      setLoading(true)
      if (activeTab === 'notes') {
        const data = await notesService.getNotes()
        setNotes(data)
      } else if (activeTab === 'reminders') {
        const data = await remindersService.getReminders()
        setReminders(data)
      } else {
        const data = await tasksService.getTasks()
        setTasks(data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNote = async () => {
    if (!noteTitle.trim()) return
    try {
      await notesService.createNote(noteTitle, noteContent)
      setNoteTitle('')
      setNoteContent('')
      setShowNoteModal(false)
      fetchData()
    } catch (error) {
      console.error('Error creating note:', error)
    }
  }

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Delete this note?')) return
    try {
      await notesService.deleteNote(id)
      fetchData()
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  const handleCreateReminder = async () => {
    if (!reminderTitle.trim() || !reminderDate || !reminderTime) return
    try {
      await remindersService.createReminder(reminderTitle, reminderDescription, reminderDate, reminderTime)
      setReminderTitle('')
      setReminderDescription('')
      setReminderDate('')
      setReminderTime('')
      setShowReminderModal(false)
      fetchData()
    } catch (error) {
      console.error('Error creating reminder:', error)
    }
  }

  const handleDeleteReminder = async (id: string) => {
    if (!confirm('Delete this reminder?')) return
    try {
      await remindersService.deleteReminder(id)
      fetchData()
    } catch (error) {
      console.error('Error deleting reminder:', error)
    }
  }

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) return
    try {
      await tasksService.createTask({ title: taskTitle })
      setTaskTitle('')
      setShowTaskModal(false)
      fetchData()
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const handleToggleTask = async (id: string, completed: boolean) => {
    try {
      await tasksService.toggleTask(id, !completed)
      fetchData()
    } catch (error) {
      console.error('Error toggling task:', error)
    }
  }

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Delete this task?')) return
    try {
      await tasksService.deleteTask(id)
      fetchData()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

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
        <h1 className="text-2xl font-black mb-6">Notes & Tasks</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['notes', 'reminders', 'tasks'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-[#A855F7] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-[#A855F7] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-400">Loading...</p>
            </div>
          ) : activeTab === 'notes' ? (
            notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <svg className="w-20 h-20 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-2xl font-bold mb-2">No notes yet</h3>
                <p className="text-gray-400 mb-6">Create your first note</p>
                <button
                  onClick={() => setShowNoteModal(true)}
                  className="bg-[#A855F7] hover:bg-[#9333EA] px-6 py-3 rounded-full font-semibold transition-all"
                >
                  Create Note
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl">
                {notes.map((note) => (
                  <div key={note.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:bg-gray-50 transition-all group shadow-sm">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="text-lg font-bold flex-1">{note.title}</h3>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg transition-all text-gray-400 hover:text-red-500"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-4 mb-3">{note.content}</p>
                    <p className="text-xs text-gray-500">{new Date(note.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )
          ) : activeTab === 'reminders' ? (
            reminders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <svg className="w-20 h-20 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <h3 className="text-2xl font-bold mb-2">No reminders yet</h3>
                <p className="text-gray-400 mb-6">Set your first reminder</p>
                <button
                  onClick={() => setShowReminderModal(true)}
                  className="bg-[#A855F7] hover:bg-[#9333EA] px-6 py-3 rounded-full font-semibold transition-all"
                >
                  Create Reminder
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-w-3xl">
                {reminders.map((reminder) => (
                  <div key={reminder.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:bg-gray-50 transition-all group shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-2">{reminder.title}</h3>
                        <p className="text-sm text-gray-400 mb-2">{reminder.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{new Date(reminder.reminder_date).toLocaleDateString()} at {reminder.reminder_time}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteReminder(reminder.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg transition-all text-gray-400 hover:text-red-500"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <svg className="w-20 h-20 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <h3 className="text-2xl font-bold mb-2">No tasks yet</h3>
                <p className="text-gray-400 mb-6">Add your first task</p>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="bg-[#A855F7] hover:bg-[#9333EA] px-6 py-3 rounded-full font-semibold transition-all"
                >
                  Create Task
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-w-2xl">
                {tasks.map((task) => (
                  <div key={task.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-all group flex items-center gap-3 shadow-sm">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleTask(task.id, task.completed)}
                      className="w-5 h-5 rounded border-2 border-[#A855F7] checked:bg-[#A855F7] cursor-pointer"
                    />
                    <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                      {task.title}
                    </span>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg transition-all text-gray-400 hover:text-red-500"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )
          )}

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 w-full max-w-2xl shadow-xl">
            <h2 className="text-2xl font-black mb-6 text-gray-900">Create Note</h2>
            <input
              type="text"
              placeholder="Note title"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full mb-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A855F7] text-gray-900"
            />
            <textarea
              placeholder="Note content"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={6}
              className="w-full mb-6 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A855F7] resize-none text-gray-900"
            />
            <div className="flex gap-3">
              <button
                onClick={handleCreateNote}
                className="flex-1 bg-[#A855F7] hover:bg-[#9333EA] px-6 py-3 rounded-full font-semibold transition-all text-white"
              >
                Create
              </button>
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-full font-semibold transition-all text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 w-full max-w-2xl shadow-xl">
            <h2 className="text-2xl font-black mb-6 text-gray-900">Create Reminder</h2>
            <input
              type="text"
              placeholder="Reminder title"
              value={reminderTitle}
              onChange={(e) => setReminderTitle(e.target.value)}
              className="w-full mb-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A855F7] text-gray-900"
            />
            <textarea
              placeholder="Description"
              value={reminderDescription}
              onChange={(e) => setReminderDescription(e.target.value)}
              rows={3}
              className="w-full mb-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A855F7] resize-none text-gray-900"
            />
            <div className="grid grid-cols-2 gap-4 mb-6">
              <input
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A855F7] text-gray-900"
              />
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A855F7] text-gray-900"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreateReminder}
                className="flex-1 bg-[#A855F7] hover:bg-[#9333EA] px-6 py-3 rounded-full font-semibold transition-all text-white"
              >
                Create
              </button>
              <button
                onClick={() => setShowReminderModal(false)}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-full font-semibold transition-all text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 w-full max-w-lg shadow-xl">
            <h2 className="text-2xl font-black mb-6 text-gray-900">Create Task</h2>
            <input
              type="text"
              placeholder="Task title"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full mb-6 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A855F7] text-gray-900"
            />
            <div className="flex gap-3">
              <button
                onClick={handleCreateTask}
                className="flex-1 bg-[#A855F7] hover:bg-[#9333EA] px-6 py-3 rounded-full font-semibold transition-all text-white"
              >
                Create
              </button>
              <button
                onClick={() => setShowTaskModal(false)}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-full font-semibold transition-all text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating AI Chat */}
      <FloatingAIChat />
      </div>
    </DashboardLayout>
  )
}
