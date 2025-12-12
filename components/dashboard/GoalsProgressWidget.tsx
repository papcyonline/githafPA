'use client'

import Link from 'next/link'
import type { Goal } from '@/lib/goals.service'

interface GoalsProgressWidgetProps {
  goals: Goal[]
}

export function GoalsProgressWidget({ goals }: GoalsProgressWidgetProps) {
  if (goals.length === 0) {
    return (
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-400">Active Goals</h3>
          <Link href="/goals" className="text-xs text-purple-400 hover:text-purple-300">
            View all
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center py-6 text-gray-500">
          <svg className="w-10 h-10 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm">No active goals</p>
          <Link href="/goals" className="mt-2 text-xs text-purple-400 hover:text-purple-300">
            Create your first goal
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400">Active Goals</h3>
        <Link href="/goals" className="text-xs text-purple-400 hover:text-purple-300">
          View all
        </Link>
      </div>
      <div className="space-y-4">
        {goals.map((goal) => (
          <div key={goal.id}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: goal.color }}
                />
                <span className="text-sm font-medium text-white truncate max-w-[180px]">
                  {goal.title}
                </span>
              </div>
              <span className="text-xs text-gray-400">{goal.progress}%</span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${goal.progress}%`,
                  backgroundColor: goal.color,
                }}
              />
            </div>
            {goal.target_date && (
              <p className="text-xs text-gray-500 mt-1">
                Target: {new Date(goal.target_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
