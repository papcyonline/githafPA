'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import type { Task, Reminder } from '@/lib/dashboard.service'
import type { CalendarEvent } from '@/lib/calendar.service'
import type { HabitWithLogs } from '@/lib/habits.service'

interface TodayOverviewWidgetProps {
  tasks: Task[]
  overdueTasks: Task[]
  events: CalendarEvent[]
  reminders: Reminder[]
  habits: HabitWithLogs[]
  onToggleTask: (id: string, completed: boolean) => void
  onToggleHabit: (id: string) => void
}

type TabType = 'tasks' | 'events' | 'reminders' | 'habits'

export function TodayOverviewWidget({
  tasks,
  overdueTasks,
  events,
  reminders,
  habits,
  onToggleTask,
  onToggleHabit,
}: TodayOverviewWidgetProps) {
  const [activeTab, setActiveTab] = useState<TabType>('tasks')

  const tabs: { id: TabType; label: string; count: number; color: string }[] = [
    { id: 'tasks', label: 'Tasks', count: tasks.length + overdueTasks.length, color: 'purple' },
    { id: 'events', label: 'Events', count: events.length, color: 'blue' },
    { id: 'reminders', label: 'Reminders', count: reminders.length, color: 'amber' },
    { id: 'habits', label: 'Habits', count: habits.length, color: 'green' },
  ]

  const priorityColors = {
    low: 'text-gray-400',
    medium: 'text-blue-400',
    high: 'text-orange-400',
    urgent: 'text-red-400',
  }

  const priorityBg = {
    low: 'bg-gray-500/20',
    medium: 'bg-blue-500/20',
    high: 'bg-orange-500/20',
    urgent: 'bg-red-500/20',
  }

  return (
    <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-zinc-800 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-white border-b-2 border-purple-500 bg-zinc-800/50'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-1.5 py-0.5 text-xs rounded-full bg-${tab.color}-500/20 text-${tab.color}-400`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-2">
            {overdueTasks.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-medium text-red-400 uppercase tracking-wide mb-2">Overdue</h4>
                {overdueTasks.map((task) => (
                  <TaskItem key={task.id} task={task} onToggle={onToggleTask} priorityColors={priorityColors} priorityBg={priorityBg} isOverdue />
                ))}
              </div>
            )}
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <TaskItem key={task.id} task={task} onToggle={onToggleTask} priorityColors={priorityColors} priorityBg={priorityBg} />
              ))
            ) : overdueTasks.length === 0 ? (
              <EmptyState message="No tasks for today" icon="task" />
            ) : null}
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-2">
            {events.length > 0 ? (
              events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
                >
                  <div
                    className="w-1 h-full min-h-[40px] rounded-full"
                    style={{ backgroundColor: event.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{event.title}</p>
                    <p className="text-sm text-gray-400">
                      {event.all_day
                        ? 'All day'
                        : `${format(parseISO(event.start_time), 'h:mm a')} - ${format(parseISO(event.end_time), 'h:mm a')}`}
                    </p>
                    {event.location && (
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.location}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState message="No events today" icon="calendar" />
            )}
          </div>
        )}

        {/* Reminders Tab */}
        {activeTab === 'reminders' && (
          <div className="space-y-2">
            {reminders.length > 0 ? (
              reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{reminder.title}</p>
                    <p className="text-sm text-gray-400">{reminder.reminder_time}</p>
                    {reminder.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{reminder.description}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState message="No reminders today" icon="bell" />
            )}
          </div>
        )}

        {/* Habits Tab */}
        {activeTab === 'habits' && (
          <div className="space-y-2">
            {habits.length > 0 ? (
              habits.map((habit) => (
                <div
                  key={habit.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
                >
                  <button
                    onClick={() => onToggleHabit(habit.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      habit.completedToday
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-600 hover:border-green-500'
                    }`}
                  >
                    {habit.completedToday && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${habit.completedToday ? 'text-gray-400' : 'text-white'}`}>
                      {habit.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {habit.current_streak > 0 ? `${habit.current_streak} day streak` : 'Start your streak!'}
                    </p>
                  </div>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: habit.color }}
                  />
                </div>
              ))
            ) : (
              <EmptyState message="No habits tracked" icon="habit" />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function TaskItem({
  task,
  onToggle,
  priorityColors,
  priorityBg,
  isOverdue = false,
}: {
  task: Task
  onToggle: (id: string, completed: boolean) => void
  priorityColors: Record<string, string>
  priorityBg: Record<string, string>
  isOverdue?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
        isOverdue ? 'bg-red-500/10 hover:bg-red-500/20' : 'bg-zinc-800/50 hover:bg-zinc-800'
      }`}
    >
      <button
        onClick={() => onToggle(task.id, !task.completed)}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          task.completed
            ? 'bg-purple-500 border-purple-500'
            : 'border-gray-600 hover:border-purple-500'
        }`}
      >
        {task.completed && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${task.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
          {task.title}
        </p>
        {task.due_time && (
          <p className="text-xs text-gray-500">{task.due_time}</p>
        )}
      </div>
      <span className={`text-xs px-2 py-0.5 rounded ${priorityBg[task.priority]} ${priorityColors[task.priority]}`}>
        {task.priority}
      </span>
    </div>
  )
}

function EmptyState({ message, icon }: { message: string; icon: string }) {
  const icons = {
    task: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    ),
    calendar: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    ),
    bell: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    ),
    habit: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  }

  return (
    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
      <svg className="w-12 h-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {icons[icon as keyof typeof icons]}
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  )
}
