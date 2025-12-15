'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

const mockPatterns = [
  {
    id: '1',
    title: 'Overdue Invoices Detected',
    type: 'financial',
    severity: 'high',
    description: '5 invoices totaling $24,500 are overdue by more than 30 days',
    affected: ['Invoice #1042', 'Invoice #1038', 'Invoice #1035', 'Invoice #1029', 'Invoice #1025'],
    action: 'Send payment reminders',
    detected: '2 hours ago',
  },
  {
    id: '2',
    title: 'Missed Project Deadline',
    type: 'operational',
    severity: 'medium',
    description: 'Website Redesign project is 5 days behind schedule',
    affected: ['Phase 2: Design Review'],
    action: 'Review timeline and reallocate resources',
    detected: '1 day ago',
  },
  {
    id: '3',
    title: 'Low Cash Flow Alert',
    type: 'financial',
    severity: 'high',
    description: 'Projected cash flow for February shows a potential shortfall of $15,000',
    affected: ['Operating expenses', 'Vendor payments'],
    action: 'Review payment schedule and receivables',
    detected: '3 hours ago',
  },
  {
    id: '4',
    title: 'Declining Sales Trend',
    type: 'sales',
    severity: 'medium',
    description: 'Sales have decreased 12% compared to the same period last month',
    affected: ['Product Category: Electronics'],
    action: 'Review marketing strategy and pricing',
    detected: '1 day ago',
  },
]

const severityColors: Record<string, { bg: string; text: string; border: string }> = {
  high: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  low: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
}

const typeIcons: Record<string, JSX.Element> = {
  financial: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  operational: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  sales: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
}

export default function PatternsPage() {
  const [filter, setFilter] = useState<'all' | 'financial' | 'operational' | 'sales'>('all')

  const filteredPatterns = filter === 'all'
    ? mockPatterns
    : mockPatterns.filter(p => p.type === filter)

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Pattern Detection</h1>
            <p className="text-gray-500 mt-1">AI-detected issues requiring your attention</p>
          </div>
          <button className="bg-[#A855F7] hover:bg-[#9333EA] px-4 py-2.5 rounded-full font-semibold transition-all inline-flex items-center gap-2 text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Analysis
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-50 rounded-xl p-4 border border-red-100">
            <div className="text-red-600 text-3xl font-bold">2</div>
            <div className="text-red-600 text-sm">High Priority</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
            <div className="text-amber-600 text-3xl font-bold">2</div>
            <div className="text-amber-600 text-sm">Medium Priority</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <div className="text-green-600 text-3xl font-bold">0</div>
            <div className="text-green-600 text-sm">Resolved Today</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <div className="text-purple-600 text-3xl font-bold">4</div>
            <div className="text-purple-600 text-sm">Total Alerts</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['all', 'financial', 'operational', 'sales'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Patterns List */}
        <div className="space-y-4">
          {filteredPatterns.map((pattern) => (
            <div
              key={pattern.id}
              className={`rounded-xl border p-5 ${severityColors[pattern.severity].bg} ${severityColors[pattern.severity].border}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${severityColors[pattern.severity].bg} ${severityColors[pattern.severity].text}`}>
                  {typeIcons[pattern.type]}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{pattern.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${severityColors[pattern.severity].text} ${severityColors[pattern.severity].bg} border ${severityColors[pattern.severity].border}`}>
                          {pattern.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600">{pattern.description}</p>
                      <div className="mt-3">
                        <p className="text-sm text-gray-500 mb-1">Affected:</p>
                        <div className="flex flex-wrap gap-2">
                          {pattern.affected.map((item, i) => (
                            <span key={i} className="px-2 py-1 bg-white/50 rounded text-sm text-gray-600">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-3">Detected {pattern.detected}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <button className="px-4 py-2 bg-white text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors border border-purple-200">
                      {pattern.action}
                    </button>
                    <button className="px-4 py-2 text-gray-600 hover:bg-white/50 rounded-lg text-sm font-medium transition-colors">
                      View Details
                    </button>
                    <button className="px-4 py-2 text-gray-600 hover:bg-white/50 rounded-lg text-sm font-medium transition-colors">
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
