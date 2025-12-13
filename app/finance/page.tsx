'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import DashboardLayout from '@/components/DashboardLayout'
import AudioRecorder from '@/components/AudioRecorder'
import { Skeleton, SkeletonStats, SkeletonChart, SkeletonTable } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'

interface FinancialEntry {
  id: string
  entry_type: 'income' | 'expense' | 'transfer' | 'investment'
  amount: number
  currency: string
  category: string
  description: string | null
  date: string
  recurring: boolean
}

interface FinancialInsights {
  totalIncome: number
  totalExpenses: number
  netCashflow: number
  savingsRate: number
  topExpenseCategories: { category: string; amount: number; percentage: number }[]
  monthlyTrend: { month: string; income: number; expenses: number }[]
  budgetStatus: { category: string; spent: number; budget: number; percentage: number }[]
}

const EXPENSE_CATEGORIES = [
  'Housing', 'Transportation', 'Food & Dining', 'Utilities', 'Healthcare',
  'Entertainment', 'Shopping', 'Education', 'Travel', 'Subscriptions',
  'Insurance', 'Debt Payments', 'Savings', 'Investments', 'Other'
]

const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Business', 'Investments', 'Rental', 'Gifts', 'Other'
]

const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#6366F1', '#14B8A6']

export default function FinancePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const toast = useToast()
  const [entries, setEntries] = useState<FinancialEntry[]>([])
  const [insights, setInsights] = useState<FinancialInsights | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showRecorder, setShowRecorder] = useState(false)
  const [showAIPrompt, setShowAIPrompt] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'budgets'>('overview')

  // Form state
  const [formData, setFormData] = useState({
    entry_type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    recurring: false,
  })

  // AI input state
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, selectedPeriod])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [entriesRes, insightsRes] = await Promise.all([
        fetch(`/api/financial/entries?limit=50`),
        fetch(`/api/financial/insights?period=${selectedPeriod}`),
      ])
      const entriesData = await entriesRes.json()
      const insightsData = await insightsRes.json()
      setEntries(entriesData.entries || [])
      setInsights(insightsData)
    } catch (error) {
      console.error('Failed to fetch financial data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/financial/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          user_id: user?.id,
        }),
      })
      if (response.ok) {
        setShowAddModal(false)
        setFormData({
          entry_type: 'expense',
          amount: '',
          category: '',
          description: '',
          date: format(new Date(), 'yyyy-MM-dd'),
          recurring: false,
        })
        fetchData()
        toast.success(`${formData.entry_type === 'income' ? 'Income' : 'Expense'} entry added successfully`)
      } else {
        toast.error('Failed to add entry. Please try again.')
      }
    } catch (error) {
      console.error('Failed to add entry:', error)
      toast.error('Failed to add entry. Please try again.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry?')) return
    try {
      const response = await fetch(`/api/financial/entries?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchData()
        toast.success('Entry deleted successfully')
      } else {
        toast.error('Failed to delete entry')
      }
    } catch (error) {
      console.error('Failed to delete entry:', error)
      toast.error('Failed to delete entry')
    }
  }

  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!aiInput.trim()) return

    setAiLoading(true)
    setAiError(null)

    try {
      // First, parse the voice command using AI
      const parseResponse = await fetch('/api/parse-voice-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: aiInput,
          context: 'finance',
        }),
      })

      if (!parseResponse.ok) {
        throw new Error('Failed to parse your input')
      }

      const parsed = await parseResponse.json()

      // Check if we got valid financial data
      if (!parsed.amount || parsed.amount <= 0) {
        throw new Error('Could not detect a valid amount. Please include an amount like "$50" or "50 dollars".')
      }

      // Determine entry type from parsed response
      const entryType = parsed.entry_type ||
        (parsed.type?.includes('income') ? 'income' : 'expense')

      // Create the financial entry
      const createResponse = await fetch('/api/financial/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entry_type: entryType,
          amount: parsed.amount,
          category: parsed.category || (entryType === 'income' ? 'Other' : 'Other'),
          description: parsed.title || parsed.description || aiInput,
          date: parsed.date || format(new Date(), 'yyyy-MM-dd'),
          recurring: false,
          user_id: user?.id,
        }),
      })

      if (!createResponse.ok) {
        throw new Error('Failed to create entry')
      }

      // Success - close modal and refresh
      setShowAIPrompt(false)
      setAiInput('')
      fetchData()
      toast.success('Entry created from your description!')
    } catch (error) {
      console.error('AI input error:', error)
      setAiError(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

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
          <h1 className="text-2xl font-black">Financial Dashboard</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRecorder(true)}
              className="flex items-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors"
              title="Record financial entry"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span className="hidden sm:inline">Record</span>
            </button>
            <button
              onClick={() => setShowAIPrompt(true)}
              className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors"
              title="Ask AI to add entry"
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
              <span className="hidden sm:inline">Add Entry</span>
            </button>
          </div>
        </div>
        {/* Period Selector */}
        <div className="flex gap-2 mb-6">
          {(['week', 'month', 'quarter', 'year'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                selectedPeriod === period
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {period}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        {insights && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-500/10 rounded-xl p-5 border border-green-500/20">
              <div className="text-sm text-green-400 mb-1">Total Income</div>
              <div className="text-2xl font-bold text-green-400">{formatCurrency(insights.totalIncome)}</div>
            </div>
            <div className="bg-red-500/10 rounded-xl p-5 border border-red-500/20">
              <div className="text-sm text-red-400 mb-1">Total Expenses</div>
              <div className="text-2xl font-bold text-red-400">{formatCurrency(insights.totalExpenses)}</div>
            </div>
            <div className={`rounded-xl p-5 border ${insights.netCashflow >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-orange-500/10 border-orange-500/20'}`}>
              <div className={`text-sm ${insights.netCashflow >= 0 ? 'text-emerald-400' : 'text-orange-400'} mb-1`}>Net Cashflow</div>
              <div className={`text-2xl font-bold ${insights.netCashflow >= 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
                {formatCurrency(insights.netCashflow)}
              </div>
            </div>
            <div className="bg-purple-500/10 rounded-xl p-5 border border-purple-500/20">
              <div className="text-sm text-purple-400 mb-1">Savings Rate</div>
              <div className="text-2xl font-bold text-purple-400">{insights.savingsRate.toFixed(1)}%</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-white/10">
          {(['overview', 'transactions', 'budgets'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-2 capitalize transition-colors relative ${
                activeTab === tab ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && insights && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trend Chart */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="font-semibold mb-4">Monthly Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={insights.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Expense Breakdown */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="font-semibold mb-4">Expense Breakdown</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={insights.topExpenseCategories}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} (${((percent || 0) * 100).toFixed(0)}%)`}
                  >
                    {insights.topExpenseCategories.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Budget Status */}
            {insights.budgetStatus.length > 0 && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 lg:col-span-2">
                <h3 className="font-semibold mb-4">Budget Status</h3>
                <div className="space-y-4">
                  {insights.budgetStatus.map((budget) => (
                    <div key={budget.category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{budget.category}</span>
                        <span className={budget.percentage >= 100 ? 'text-red-400' : budget.percentage >= 80 ? 'text-orange-400' : 'text-green-400'}>
                          {formatCurrency(budget.spent)} / {formatCurrency(budget.budget)}
                        </span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${budget.percentage >= 100 ? 'bg-red-500' : budget.percentage >= 80 ? 'bg-orange-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-gray-400 font-medium">Date</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Category</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Description</th>
                    <th className="text-right p-4 text-gray-400 font-medium">Amount</th>
                    <th className="text-right p-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4">{format(new Date(entry.date), 'MMM d, yyyy')}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${entry.entry_type === 'income' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {entry.category}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400">{entry.description || '-'}</td>
                      <td className={`p-4 text-right font-medium ${entry.entry_type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                        {entry.entry_type === 'income' ? '+' : '-'}{formatCurrency(entry.amount)}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {entries.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                No transactions yet. Add your first entry!
              </div>
            )}
          </div>
        )}

        {/* Budgets Tab */}
        {activeTab === 'budgets' && (
          <div className="text-center py-12 text-gray-400">
            Budget management coming soon...
          </div>
        )}

      </div>

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4 border border-white/10">
            <h2 className="text-xl font-bold mb-4">Add Entry</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(d => ({ ...d, entry_type: 'expense', category: '' }))}
                  className={`flex-1 py-2 rounded-lg transition-colors ${formData.entry_type === 'expense' ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-gray-400'}`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(d => ({ ...d, entry_type: 'income', category: '' }))}
                  className={`flex-1 py-2 rounded-lg transition-colors ${formData.entry_type === 'income' ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-400'}`}
                >
                  Income
                </button>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData(d => ({ ...d, amount: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Category</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData(d => ({ ...d, category: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select category</option>
                  {(formData.entry_type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(d => ({ ...d, description: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Optional description"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData(d => ({ ...d, date: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-white/5 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-500 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Add Entry
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
          onRecordingComplete={fetchData}
          context="finance"
          contextHint="Describe your financial transaction. For example: 'Paid $50 for groceries' or 'Received $1000 salary'"
        />
      )}

      {/* AI Prompt Modal */}
      {showAIPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add Financial Entry with AI</h2>
              <button
                onClick={() => {
                  setShowAIPrompt(false)
                  setAiInput('')
                  setAiError(null)
                }}
                className="text-gray-400 hover:text-white transition-colors"
                disabled={aiLoading}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAISubmit}>
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">
                  Describe your transaction in natural language
                </label>
                <textarea
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="e.g., 'Spent $45 on dinner at the restaurant' or 'Got paid $2000 for freelance work'"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                  required
                  disabled={aiLoading}
                />
                <p className="text-xs text-gray-500 mt-2">
                  The AI will automatically extract the amount, category, and type
                </p>
              </div>

              {/* Error message */}
              {aiError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400">{aiError}</p>
                </div>
              )}

              {/* Example prompts */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Try these examples:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Paid $50 for groceries',
                    'Received $3000 salary',
                    'Spent $120 on electricity bill',
                  ].map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => setAiInput(example)}
                      className="text-xs px-2 py-1 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                      disabled={aiLoading}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAIPrompt(false)
                    setAiInput('')
                    setAiError(null)
                  }}
                  className="flex-1 bg-white/5 py-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                  disabled={aiLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-500 py-2 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={aiLoading || !aiInput.trim()}
                >
                  {aiLoading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Create Entry'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
