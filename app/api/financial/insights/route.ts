import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths } from 'date-fns'
import { ENABLE_MOCK_DATA, mockFinancialInsights } from '@/lib/mock-data'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  // Return mock data if enabled
  if (ENABLE_MOCK_DATA) {
    return NextResponse.json(mockFinancialInsights)
  }

  try {
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || 'month'

    const now = new Date()
    let dateFrom: Date
    let dateTo: Date = now

    switch (period) {
      case 'week':
        dateFrom = startOfWeek(now)
        dateTo = endOfWeek(now)
        break
      case 'month':
        dateFrom = startOfMonth(now)
        dateTo = endOfMonth(now)
        break
      case 'quarter':
        dateFrom = startOfMonth(subMonths(now, 2))
        dateTo = endOfMonth(now)
        break
      case 'year':
        dateFrom = new Date(now.getFullYear(), 0, 1)
        dateTo = new Date(now.getFullYear(), 11, 31)
        break
      default:
        dateFrom = startOfMonth(now)
        dateTo = endOfMonth(now)
    }

    const fromStr = format(dateFrom, 'yyyy-MM-dd')
    const toStr = format(dateTo, 'yyyy-MM-dd')

    // Fetch entries for the period
    const { data: entries, error: entriesError } = await supabase
      .from('financial_entries')
      .select('*')
      .gte('date', fromStr)
      .lte('date', toStr)

    if (entriesError) throw entriesError

    // Fetch budgets
    const { data: budgets, error: budgetsError } = await supabase
      .from('financial_budgets')
      .select('*')
      .eq('is_active', true)

    if (budgetsError) throw budgetsError

    // Calculate totals
    const income = (entries || []).filter(e => e.entry_type === 'income')
    const expenses = (entries || []).filter(e => e.entry_type === 'expense')

    const totalIncome = income.reduce((sum, e) => sum + Number(e.amount), 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
    const netCashflow = totalIncome - totalExpenses

    // Category breakdown for expenses
    const categoryTotals: Record<string, number> = {}
    expenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount)
    })

    const topExpenseCategories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    // Budget status
    const budgetStatus = (budgets || []).map(budget => {
      const spent = categoryTotals[budget.category] || 0
      return {
        category: budget.category,
        spent,
        budget: Number(budget.amount),
        percentage: (spent / Number(budget.amount)) * 100,
      }
    })

    // Monthly trend (last 6 months)
    const monthlyTrend: { month: string; income: number; expenses: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i)
      const monthStart = format(startOfMonth(monthDate), 'yyyy-MM-dd')
      const monthEnd = format(endOfMonth(monthDate), 'yyyy-MM-dd')
      const monthLabel = format(monthDate, 'MMM')

      const { data: monthEntries } = await supabase
        .from('financial_entries')
        .select('*')
        .gte('date', monthStart)
        .lte('date', monthEnd)

      const monthIncome = (monthEntries || [])
        .filter(e => e.entry_type === 'income')
        .reduce((sum, e) => sum + Number(e.amount), 0)

      const monthExpenses = (monthEntries || [])
        .filter(e => e.entry_type === 'expense')
        .reduce((sum, e) => sum + Number(e.amount), 0)

      monthlyTrend.push({ month: monthLabel, income: monthIncome, expenses: monthExpenses })
    }

    // Savings rate
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0

    return NextResponse.json({
      totalIncome,
      totalExpenses,
      netCashflow,
      topExpenseCategories,
      monthlyTrend,
      budgetStatus,
      savingsRate: Math.max(0, savingsRate),
    })
  } catch (error: any) {
    console.error('Get financial insights error:', error)
    // Return empty data if tables don't exist
    return NextResponse.json({
      totalIncome: 0,
      totalExpenses: 0,
      netCashflow: 0,
      topExpenseCategories: [],
      monthlyTrend: [],
      budgetStatus: [],
      savingsRate: 0,
    })
  }
}
