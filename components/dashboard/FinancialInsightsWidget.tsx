'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface FinancialInsights {
  totalIncome: number
  totalExpenses: number
  netCashflow: number
  savingsRate: number
  topExpenseCategories: { category: string; amount: number; percentage: number }[]
  budgetStatus: { category: string; spent: number; budget: number; percentage: number }[]
}

export function FinancialInsightsWidget() {
  const [insights, setInsights] = useState<FinancialInsights | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    try {
      const response = await fetch('/api/financial/insights?period=month')
      const data = await response.json()
      setInsights(data)
    } catch (error) {
      console.error('Failed to fetch financial insights:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10 animate-pulse">
        <div className="h-6 bg-white/10 rounded w-40 mb-4"></div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="h-20 bg-white/10 rounded-lg"></div>
          <div className="h-20 bg-white/10 rounded-lg"></div>
          <div className="h-20 bg-white/10 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (!insights || (insights.totalIncome === 0 && insights.totalExpenses === 0)) {
    return (
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h3 className="font-semibold text-white mb-4">Financial Insights</h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-400 mb-4">Start tracking your finances</p>
          <Link
            href="/finance"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Entry
          </Link>
        </div>
      </div>
    )
  }

  const budgetAlerts = insights.budgetStatus.filter(b => b.percentage >= 80)

  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Financial Insights</h3>
        <Link href="/finance" className="text-sm text-purple-400 hover:text-purple-300">
          View all →
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
          <div className="text-xs text-green-400 mb-1">Income</div>
          <div className="text-lg font-bold text-green-400">
            {formatCurrency(insights.totalIncome)}
          </div>
        </div>
        <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
          <div className="text-xs text-red-400 mb-1">Expenses</div>
          <div className="text-lg font-bold text-red-400">
            {formatCurrency(insights.totalExpenses)}
          </div>
        </div>
        <div className={`rounded-lg p-3 border ${insights.netCashflow >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-orange-500/10 border-orange-500/20'}`}>
          <div className={`text-xs ${insights.netCashflow >= 0 ? 'text-emerald-400' : 'text-orange-400'} mb-1`}>Cashflow</div>
          <div className={`text-lg font-bold ${insights.netCashflow >= 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
            {formatCurrency(insights.netCashflow)}
          </div>
        </div>
      </div>

      {/* Savings Rate */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-400">Savings Rate</span>
          <span className={`font-medium ${insights.savingsRate >= 20 ? 'text-green-400' : insights.savingsRate >= 10 ? 'text-yellow-400' : 'text-red-400'}`}>
            {insights.savingsRate.toFixed(1)}%
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${insights.savingsRate >= 20 ? 'bg-green-500' : insights.savingsRate >= 10 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min(insights.savingsRate, 100)}%` }}
          />
        </div>
      </div>

      {/* Top Expenses */}
      {insights.topExpenseCategories.length > 0 && (
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Top Expenses</div>
          <div className="space-y-2">
            {insights.topExpenseCategories.slice(0, 3).map((cat) => (
              <div key={cat.category} className="flex items-center justify-between text-sm">
                <span className="text-white">{cat.category}</span>
                <span className="text-gray-400">{formatCurrency(cat.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <div className="border-t border-white/10 pt-4 mt-4">
          <div className="text-sm text-orange-400 mb-2">
            {budgetAlerts.length} budget{budgetAlerts.length !== 1 ? 's' : ''} at risk
          </div>
          {budgetAlerts.slice(0, 2).map((b) => (
            <div key={b.category} className="flex items-center justify-between text-sm py-1">
              <span className="text-white">{b.category}</span>
              <span className={b.percentage >= 100 ? 'text-red-400' : 'text-orange-400'}>
                {b.percentage.toFixed(0)}% used
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
