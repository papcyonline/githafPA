'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

const mockCashflow = {
  opening: 125000,
  inflows: 85000,
  outflows: 62000,
  closing: 148000,
  projected: 160000,
}

const mockPnL = {
  revenue: 185000,
  cogs: 74000,
  grossProfit: 111000,
  expenses: 65000,
  netProfit: 46000,
}

const mockReceivables = [
  { id: '1', client: 'Acme Corp', amount: 15000, dueDate: 'Jan 15, 2024', daysOverdue: 10, status: 'overdue' },
  { id: '2', client: 'Tech Solutions', amount: 8500, dueDate: 'Jan 25, 2024', daysOverdue: 0, status: 'due' },
  { id: '3', client: 'Global Industries', amount: 22000, dueDate: 'Feb 1, 2024', daysOverdue: 0, status: 'upcoming' },
  { id: '4', client: 'StartupXYZ', amount: 5000, dueDate: 'Dec 20, 2023', daysOverdue: 35, status: 'overdue' },
]

const statusColors: Record<string, string> = {
  overdue: 'bg-red-100 text-red-600',
  due: 'bg-amber-100 text-amber-600',
  upcoming: 'bg-green-100 text-green-600',
}

export default function FinancialInsightsPage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Financial Insights</h1>
            <p className="text-gray-500 mt-1">Real-time cashflow, P&L, and receivables overview</p>
          </div>
          <div className="flex items-center gap-2">
            {(['week', 'month', 'quarter', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  period === p
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Cashflow Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cashflow Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Opening Balance</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(mockCashflow.opening)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 mb-1">Cash Inflows</p>
              <p className="text-xl font-bold text-green-600">+{formatCurrency(mockCashflow.inflows)}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-red-600 mb-1">Cash Outflows</p>
              <p className="text-xl font-bold text-red-600">-{formatCurrency(mockCashflow.outflows)}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 mb-1">Closing Balance</p>
              <p className="text-xl font-bold text-purple-600">{formatCurrency(mockCashflow.closing)}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 mb-1">30-Day Forecast</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(mockCashflow.projected)}</p>
            </div>
          </div>
        </div>

        {/* P&L Snapshot */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">P&L Snapshot</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600">Revenue</span>
                <span className="font-semibold text-gray-900">{formatCurrency(mockPnL.revenue)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600">Cost of Goods Sold</span>
                <span className="font-semibold text-red-600">-{formatCurrency(mockPnL.cogs)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600">Gross Profit</span>
                <span className="font-semibold text-green-600">{formatCurrency(mockPnL.grossProfit)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600">Operating Expenses</span>
                <span className="font-semibold text-red-600">-{formatCurrency(mockPnL.expenses)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-semibold text-gray-900">Net Profit</span>
                <span className="text-xl font-bold text-green-600">{formatCurrency(mockPnL.netProfit)}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Gross Margin</span>
                <span className="font-medium text-gray-900">60%</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-500">Net Margin</span>
                <span className="font-medium text-gray-900">24.9%</span>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Days Sales Outstanding</span>
                  <span className="font-bold text-gray-900">32 days</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '65%' }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">Target: 30 days</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Current Ratio</span>
                  <span className="font-bold text-green-600">2.4</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '80%' }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">Healthy: Above 1.5</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Burn Rate</span>
                  <span className="font-bold text-gray-900">$15,500/month</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '45%' }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">9.5 months runway</p>
              </div>
            </div>
          </div>
        </div>

        {/* Aged Receivables */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Aged Receivables</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Client</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Amount</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Due Date</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockReceivables.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{item.client}</td>
                  <td className="px-4 py-3 text-gray-900">{formatCurrency(item.amount)}</td>
                  <td className="px-4 py-3 text-gray-500">{item.dueDate}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
                      {item.status === 'overdue' ? `${item.daysOverdue} days overdue` : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                      Send Reminder
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
