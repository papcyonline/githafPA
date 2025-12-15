'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

const mockProposals = [
  {
    id: '1',
    title: 'Enterprise Software Solution',
    client: 'Acme Corporation',
    value: 125000,
    status: 'sent',
    createdAt: 'Jan 22, 2024',
    expiresAt: 'Feb 5, 2024',
  },
  {
    id: '2',
    title: 'Marketing Campaign Package',
    client: 'Tech Startup Inc',
    value: 45000,
    status: 'draft',
    createdAt: 'Jan 20, 2024',
    expiresAt: 'Feb 3, 2024',
  },
  {
    id: '3',
    title: 'Consulting Retainer Agreement',
    client: 'Global Industries',
    value: 72000,
    status: 'viewed',
    createdAt: 'Jan 18, 2024',
    expiresAt: 'Feb 1, 2024',
  },
  {
    id: '4',
    title: 'Website Redesign Project',
    client: 'Fashion Brand Co',
    value: 35000,
    status: 'accepted',
    createdAt: 'Jan 15, 2024',
    expiresAt: 'Jan 29, 2024',
  },
]

const mockTemplates = [
  { id: '1', name: 'Software Development', uses: 24 },
  { id: '2', name: 'Consulting Services', uses: 18 },
  { id: '3', name: 'Marketing Package', uses: 15 },
  { id: '4', name: 'Maintenance Contract', uses: 12 },
]

const statusColors: Record<string, { bg: string; text: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-600' },
  sent: { bg: 'bg-blue-100', text: 'text-blue-600' },
  viewed: { bg: 'bg-amber-100', text: 'text-amber-600' },
  accepted: { bg: 'bg-green-100', text: 'text-green-600' },
  declined: { bg: 'bg-red-100', text: 'text-red-600' },
}

export default function ProposalsPage() {
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'sent' | 'accepted'>('all')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const filteredProposals = activeTab === 'all'
    ? mockProposals
    : mockProposals.filter(p => p.status === activeTab)

  const totalValue = mockProposals.reduce((sum, p) => sum + p.value, 0)
  const acceptedValue = mockProposals.filter(p => p.status === 'accepted').reduce((sum, p) => sum + p.value, 0)

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Client Proposals</h1>
            <p className="text-gray-500 mt-1">Create and manage sales proposals</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#A855F7] hover:bg-[#9333EA] px-4 py-2.5 rounded-full font-semibold transition-all inline-flex items-center gap-2 text-white"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Proposal
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">Total Proposals</p>
            <p className="text-2xl font-bold text-gray-900">{mockProposals.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">Pipeline Value</p>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalValue)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">Won Value</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(acceptedValue)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">Win Rate</p>
            <p className="text-2xl font-bold text-blue-600">75%</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-2 mb-4 border-b border-gray-200">
              {(['all', 'draft', 'sent', 'accepted'] as const).map((tab) => (
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

            {/* Proposals List */}
            <div className="space-y-3">
              {filteredProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{proposal.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[proposal.status].bg} ${statusColors[proposal.status].text}`}>
                          {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-500">{proposal.client}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <span>Created: {proposal.createdAt}</span>
                        <span>Expires: {proposal.expiresAt}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(proposal.value)}</p>
                      <div className="flex items-center gap-2 mt-2">
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
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
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
              <h3 className="font-semibold text-gray-900 mb-4">Quick Templates</h3>
              <div className="space-y-2">
                {mockTemplates.map((template) => (
                  <button
                    key={template.id}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-gray-700">{template.name}</span>
                    </div>
                    <span className="text-xs text-gray-400">{template.uses} uses</span>
                  </button>
                ))}
              </div>
              <button className="w-full mt-4 px-4 py-2 border border-purple-200 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors">
                Manage Templates
              </button>
            </div>

            {/* AI Assistant */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-5 text-white">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">AI Proposal Generator</h3>
              <p className="text-sm text-purple-100 mb-4">Create professional proposals in seconds using AI</p>
              <button className="w-full px-4 py-2 bg-white text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors">
                Generate with AI
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
