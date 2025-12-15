'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

const mockInsights = [
  {
    id: '1',
    title: 'Revenue Growth Opportunity',
    type: 'opportunity',
    summary: 'Based on your Q4 performance, expanding into the UAE market could increase revenue by 25-30%.',
    source: 'Financial Reports, Market Analysis',
    priority: 'high',
    date: 'Jan 22, 2024',
  },
  {
    id: '2',
    title: 'Cost Optimization Identified',
    type: 'cost',
    summary: 'Switching to annual software subscriptions could save approximately $12,000 per year.',
    source: 'Expense Reports, Vendor Contracts',
    priority: 'medium',
    date: 'Jan 21, 2024',
  },
  {
    id: '3',
    title: 'Customer Retention Risk',
    type: 'risk',
    summary: 'Three key clients have not renewed contracts. Recommend immediate outreach.',
    source: 'CRM Data, Email Analysis',
    priority: 'high',
    date: 'Jan 20, 2024',
  },
]

const documentSummaries = [
  { id: '1', title: '2024 Business Plan', pages: 45, lastUpdated: 'Jan 15, 2024', insights: 12 },
  { id: '2', title: 'Q4 Financial Report', pages: 28, lastUpdated: 'Jan 10, 2024', insights: 8 },
  { id: '3', title: 'Marketing Strategy', pages: 32, lastUpdated: 'Jan 5, 2024', insights: 6 },
]

const typeColors: Record<string, string> = {
  opportunity: 'bg-green-100 text-green-600 border-green-200',
  cost: 'bg-blue-100 text-blue-600 border-blue-200',
  risk: 'bg-red-100 text-red-600 border-red-200',
}

const priorityColors: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-green-500',
}

export default function StrategyPage() {
  const [activeTab, setActiveTab] = useState<'insights' | 'documents' | 'ask'>('insights')

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Strategy Insights</h1>
            <p className="text-gray-500 mt-1">AI-powered business intelligence and recommendations</p>
          </div>
          <button className="bg-[#A855F7] hover:bg-[#9333EA] px-4 py-2.5 rounded-full font-semibold transition-all inline-flex items-center gap-2 text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload Document
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {(['insights', 'documents', 'ask'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium transition-colors relative ${
                activeTab === tab ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'insights' && 'AI Insights'}
              {tab === 'documents' && 'Documents'}
              {tab === 'ask' && 'Ask AI'}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
              )}
            </button>
          ))}
        </div>

        {activeTab === 'insights' && (
          <div className="space-y-4">
            {mockInsights.map((insight) => (
              <div key={insight.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className={`w-2 h-full rounded-full ${priorityColors[insight.priority]}`} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${typeColors[insight.type]}`}>
                            {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                          </span>
                          <span className="text-xs text-gray-400">{insight.date}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 text-lg">{insight.title}</h3>
                        <p className="text-gray-600 mt-2">{insight.summary}</p>
                        <p className="text-sm text-gray-400 mt-2">Source: {insight.source}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <button className="px-4 py-2 bg-purple-100 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors">
                        View Details
                      </button>
                      <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">
                        Create Task
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentSummaries.map((doc) => (
              <div key={doc.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{doc.pages} pages</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-400">Updated {doc.lastUpdated}</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-xs font-medium">
                    {doc.insights} insights
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'ask' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Ask about your business</h3>
              <p className="text-gray-500 mt-2">Get insights based on your documents, reports, and data</p>
            </div>
            <div className="relative">
              <textarea
                placeholder="Ask a question about your business strategy, financials, or operations..."
                className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={4}
              />
              <button className="absolute bottom-4 right-4 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
                Ask AI
              </button>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Example questions:</p>
              <div className="flex flex-wrap gap-2">
                <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-600 transition-colors">
                  What are our top growth opportunities?
                </button>
                <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-600 transition-colors">
                  How can we reduce costs?
                </button>
                <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-600 transition-colors">
                  What risks should we address?
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
