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
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="h-20 bg-gray-200 rounded-lg"></div>
          <div className="h-20 bg-gray-200 rounded-lg"></div>
          <div className="h-20 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (!insights || (insights.totalIncome === 0 && insights.totalExpenses === 0)) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Financial Insights</h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500 mb-4">Start tracking your finances</p>
          <Link
            href="/finance"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
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
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Financial Insights</h3>
        <Link href="/finance" className="text-sm text-purple-600 hover:text-purple-700">
          View all
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <div className="text-xs text-green-700 mb-1">Income</div>
          <div className="text-lg font-bold text-green-700">
            {formatCurrency(insights.totalIncome)}
          </div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
          <div className="text-xs text-red-700 mb-1">Expenses</div>
          <div className="text-lg font-bold text-red-700">
            {formatCurrency(insights.totalExpenses)}
          </div>
        </div>
        <div className={`rounded-lg p-3 border ${insights.netCashflow >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50 border-orange-200'}`}>
          <div className={`text-xs ${insights.netCashflow >= 0 ? 'text-emerald-700' : 'text-orange-700'} mb-1`}>Cashflow</div>
          <div className={`text-lg font-bold ${insights.netCashflow >= 0 ? 'text-emerald-700' : 'text-orange-700'}`}>
            {formatCurrency(insights.netCashflow)}
          </div>
        </div>
      </div>

      {/* Savings Rate */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Savings Rate</span>
          <span className={`font-medium ${insights.savingsRate >= 20 ? 'text-green-600' : insights.savingsRate >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
            {insights.savingsRate.toFixed(1)}%
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${insights.savingsRate >= 20 ? 'bg-green-500' : insights.savingsRate >= 10 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min(insights.savingsRate, 100)}%` }}
          />
        </div>
      </div>

      {/* Top Expenses */}
      {insights.topExpenseCategories.length > 0 && (
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">Top Expenses</div>
          <div className="space-y-2">
            {insights.topExpenseCategories.slice(0, 3).map((cat) => (
              <div key={cat.category} className="flex items-center justify-between text-sm">
                <span className="text-gray-900">{cat.category}</span>
                <span className="text-gray-500">{formatCurrency(cat.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="text-sm text-orange-600 mb-2">
            {budgetAlerts.length} budget{budgetAlerts.length !== 1 ? 's' : ''} at risk
          </div>
          {budgetAlerts.slice(0, 2).map((b) => (
            <div key={b.category} className="flex items-center justify-between text-sm py-1">
              <span className="text-gray-900">{b.category}</span>
              <span className={b.percentage >= 100 ? 'text-red-600' : 'text-orange-600'}>
                {b.percentage.toFixed(0)}% used
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
