'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

const mockEmails = [
  {
    id: '1',
    subject: 'Follow-up: Partnership Discussion',
    recipient: 'john@acmecorp.com',
    status: 'sent',
    type: 'follow-up',
    sentAt: 'Jan 22, 2024 10:30 AM',
    openRate: 'Opened 3 times',
  },
  {
    id: '2',
    subject: 'Introduction: Our Services',
    recipient: 'sarah@techstartup.io',
    status: 'draft',
    type: 'cold-outreach',
    sentAt: null,
    openRate: null,
  },
  {
    id: '3',
    subject: 'Thank you for your time',
    recipient: 'mike@globalind.com',
    status: 'sent',
    type: 'thank-you',
    sentAt: 'Jan 20, 2024 3:15 PM',
    openRate: 'Opened 1 time',
  },
  {
    id: '4',
    subject: 'Proposal for Q1 2024',
    recipient: 'lisa@enterprise.co',
    status: 'scheduled',
    type: 'proposal',
    sentAt: 'Scheduled for Jan 25, 2024',
    openRate: null,
  },
]

const emailTemplates = [
  { id: '1', name: 'Cold Outreach', description: 'First contact with potential clients' },
  { id: '2', name: 'Follow-up', description: 'After meeting or call' },
  { id: '3', name: 'Proposal Introduction', description: 'Accompany your proposal' },
  { id: '4', name: 'Thank You', description: 'Post-meeting appreciation' },
  { id: '5', name: 'Re-engagement', description: 'Reconnect with cold leads' },
]

const statusColors: Record<string, { bg: string; text: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-600' },
  sent: { bg: 'bg-green-100', text: 'text-green-600' },
  scheduled: { bg: 'bg-blue-100', text: 'text-blue-600' },
  failed: { bg: 'bg-red-100', text: 'text-red-600' },
}

export default function SalesEmailsPage() {
  const [showComposer, setShowComposer] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'sent' | 'draft' | 'scheduled'>('all')

  const filteredEmails = activeTab === 'all'
    ? mockEmails
    : mockEmails.filter(e => e.status === activeTab)

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Sales Emails</h1>
            <p className="text-gray-500 mt-1">Draft and send personalized sales emails</p>
          </div>
          <button
            onClick={() => setShowComposer(true)}
            className="bg-[#A855F7] hover:bg-[#9333EA] px-4 py-2.5 rounded-full font-semibold transition-all inline-flex items-center gap-2 text-white"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Compose Email
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">Emails Sent</p>
            <p className="text-2xl font-bold text-gray-900">156</p>
            <p className="text-xs text-green-600 mt-1">+12% this week</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">Open Rate</p>
            <p className="text-2xl font-bold text-blue-600">42%</p>
            <p className="text-xs text-green-600 mt-1">+5% this week</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">Reply Rate</p>
            <p className="text-2xl font-bold text-purple-600">18%</p>
            <p className="text-xs text-green-600 mt-1">+2% this week</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">Scheduled</p>
            <p className="text-2xl font-bold text-amber-600">8</p>
            <p className="text-xs text-gray-400 mt-1">Next 7 days</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-2 mb-4 border-b border-gray-200">
              {(['all', 'sent', 'draft', 'scheduled'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 font-medium transition-colors relative ${
                    activeTab === tab ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
                  )}
                </button>
              ))}
            </div>

            {/* Email List */}
            <div className="space-y-3">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{email.subject}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[email.status].bg} ${statusColors[email.status].text}`}>
                          {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm">To: {email.recipient}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        {email.sentAt && <span>{email.sentAt}</span>}
                        {email.openRate && (
                          <span className="flex items-center gap-1 text-green-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {email.openRate}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Templates */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Email Templates</h3>
              <div className="space-y-2">
                {emailTemplates.map((template) => (
                  <button
                    key={template.id}
                    className="w-full flex items-start gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                  >
                    <svg className="w-5 h-5 text-purple-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-gray-700 font-medium">{template.name}</p>
                      <p className="text-xs text-gray-500">{template.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Assistant */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-5 text-white">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">AI Email Writer</h3>
              <p className="text-sm text-blue-100 mb-4">Let AI write personalized emails based on context and history</p>
              <button className="w-full px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
                Write with AI
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left">
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span className="text-gray-700">Import Contacts</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left">
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-gray-700">View Analytics</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left">
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-700">Email Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
