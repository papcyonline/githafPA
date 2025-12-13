import { supabase } from './supabase'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths, parseISO } from 'date-fns'

export interface FinancialEntry {
  id: string
  user_id: string
  entry_type: 'income' | 'expense' | 'transfer' | 'investment'
  amount: number
  currency: string
  category: string
  description: string | null
  date: string
  recurring: boolean
  recurrence_rule: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
}

export interface FinancialBudget {
  id: string
  user_id: string
  category: string
  amount: number
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  start_date: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CategoryBreakdown {
  category: string
  amount: number
  percentage: number
  budget?: number
  budgetPercentage?: number
}

export interface FinancialInsights {
  totalIncome: number
  totalExpenses: number
  netCashflow: number
  topExpenseCategories: CategoryBreakdown[]
  monthlyTrend: { month: string; income: number; expenses: number }[]
  budgetStatus: { category: string; spent: number; budget: number; percentage: number }[]
  savingsRate: number
}

// Default expense categories
export const EXPENSE_CATEGORIES = [
  'Housing', 'Transportation', 'Food & Dining', 'Utilities', 'Healthcare',
  'Entertainment', 'Shopping', 'Education', 'Travel', 'Subscriptions',
  'Insurance', 'Debt Payments', 'Savings', 'Investments', 'Other'
]

export const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Business', 'Investments', 'Rental', 'Gifts', 'Other'
]

export const financialService = {
  // ENTRIES CRUD
  async getEntries(options?: {
    type?: string
    category?: string
    dateFrom?: string
    dateTo?: string
    limit?: number
  }): Promise<FinancialEntry[]> {
    let query = supabase
      .from('financial_entries')
      .select('*')
      .order('date', { ascending: false })

    if (options?.type) {
      query = query.eq('entry_type', options.type)
    }
    if (options?.category) {
      query = query.eq('category', options.category)
    }
    if (options?.dateFrom) {
      query = query.gte('date', options.dateFrom)
    }
    if (options?.dateTo) {
      query = query.lte('date', options.dateTo)
    }
    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },

  async createEntry(input: Omit<FinancialEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<FinancialEntry> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('financial_entries')
      .insert({
        ...input,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateEntry(id: string, updates: Partial<FinancialEntry>): Promise<FinancialEntry> {
    const { data, error } = await supabase
      .from('financial_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteEntry(id: string): Promise<void> {
    const { error } = await supabase
      .from('financial_entries')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // BUDGETS CRUD
  async getBudgets(): Promise<FinancialBudget[]> {
    const { data, error } = await supabase
      .from('financial_budgets')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })

    if (error) throw error
    return data || []
  },

  async createBudget(input: Omit<FinancialBudget, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<FinancialBudget> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('financial_budgets')
      .insert({
        ...input,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateBudget(id: string, updates: Partial<FinancialBudget>): Promise<FinancialBudget> {
    const { data, error } = await supabase
      .from('financial_budgets')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteBudget(id: string): Promise<void> {
    const { error } = await supabase
      .from('financial_budgets')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // INSIGHTS & ANALYTICS
  async getInsights(period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<FinancialInsights> {
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
    }

    const fromStr = format(dateFrom, 'yyyy-MM-dd')
    const toStr = format(dateTo, 'yyyy-MM-dd')

    // Fetch entries for the period
    const entries = await this.getEntries({ dateFrom: fromStr, dateTo: toStr })
    const budgets = await this.getBudgets()

    // Calculate totals
    const income = entries.filter(e => e.entry_type === 'income')
    const expenses = entries.filter(e => e.entry_type === 'expense')

    const totalIncome = income.reduce((sum, e) => sum + Number(e.amount), 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
    const netCashflow = totalIncome - totalExpenses

    // Category breakdown for expenses
    const categoryTotals: Record<string, number> = {}
    expenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount)
    })

    const topExpenseCategories: CategoryBreakdown[] = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    // Budget status
    const budgetStatus = budgets.map(budget => {
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

      const monthEntries = entries.filter(e =>
        e.date >= monthStart && e.date <= monthEnd
      )

      const monthIncome = monthEntries
        .filter(e => e.entry_type === 'income')
        .reduce((sum, e) => sum + Number(e.amount), 0)

      const monthExpenses = monthEntries
        .filter(e => e.entry_type === 'expense')
        .reduce((sum, e) => sum + Number(e.amount), 0)

      monthlyTrend.push({ month: monthLabel, income: monthIncome, expenses: monthExpenses })
    }

    // Savings rate
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0

    return {
      totalIncome,
      totalExpenses,
      netCashflow,
      topExpenseCategories,
      monthlyTrend,
      budgetStatus,
      savingsRate: Math.max(0, savingsRate),
    }
  },

  async getQuickStats(): Promise<{
    monthlyIncome: number
    monthlyExpenses: number
    cashflow: number
    budgetAlerts: number
  }> {
    const now = new Date()
    const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
    const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')

    const entries = await this.getEntries({ dateFrom: monthStart, dateTo: monthEnd })
    const budgets = await this.getBudgets()

    const monthlyIncome = entries
      .filter(e => e.entry_type === 'income')
      .reduce((sum, e) => sum + Number(e.amount), 0)

    const monthlyExpenses = entries
      .filter(e => e.entry_type === 'expense')
      .reduce((sum, e) => sum + Number(e.amount), 0)

    // Count budget alerts (over 80% of budget)
    const categoryTotals: Record<string, number> = {}
    entries
      .filter(e => e.entry_type === 'expense')
      .forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount)
      })

    const budgetAlerts = budgets.filter(b => {
      const spent = categoryTotals[b.category] || 0
      return spent >= Number(b.amount) * 0.8
    }).length

    return {
      monthlyIncome,
      monthlyExpenses,
      cashflow: monthlyIncome - monthlyExpenses,
      budgetAlerts,
    }
  },

  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount)
  },

  getEntryTypeColor(type: FinancialEntry['entry_type']): string {
    const colors: Record<string, string> = {
      income: 'text-green-400 bg-green-500/20',
      expense: 'text-red-400 bg-red-500/20',
      transfer: 'text-blue-400 bg-blue-500/20',
      investment: 'text-purple-400 bg-purple-500/20',
    }
    return colors[type] || colors.expense
  },
}
