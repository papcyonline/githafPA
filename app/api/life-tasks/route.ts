import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { format, addDays, addMonths, addYears } from 'date-fns'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const includeInactive = searchParams.get('includeInactive') === 'true'

    let query = supabase
      .from('life_tasks')
      .select('*')
      .order('next_due_at', { ascending: true, nullsFirst: false })

    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ tasks: data || [] })
  } catch (error: any) {
    console.error('Get life tasks error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Calculate next_due_at if not provided
    const next_due_at = body.next_due_at || body.due_date || null

    const { data, error } = await supabase
      .from('life_tasks')
      .insert({
        ...body,
        next_due_at,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ task: data })
  } catch (error: any) {
    console.error('Create life task error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, action, ...updates } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Handle complete action
    if (action === 'complete') {
      // First get the task to check recurrence
      const { data: task, error: fetchError } = await supabase
        .from('life_tasks')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const now = new Date()
      const updateData: any = {
        last_completed_at: now.toISOString(),
      }

      // Calculate next due date based on recurrence
      if (task.recurrence_rule) {
        const nextDue = calculateNextDueDate(now, task.recurrence_rule)
        updateData.next_due_at = format(nextDue, 'yyyy-MM-dd')
      } else {
        // Non-recurring tasks become inactive
        updateData.is_active = false
      }

      const { data, error } = await supabase
        .from('life_tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ task: data })
    }

    // Regular update
    const { data, error } = await supabase
      .from('life_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ task: data })
  } catch (error: any) {
    console.error('Update life task error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('life_tasks')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete life task error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function calculateNextDueDate(fromDate: Date, recurrenceRule: string): Date {
  switch (recurrenceRule.toLowerCase()) {
    case 'daily':
      return addDays(fromDate, 1)
    case 'weekly':
      return addDays(fromDate, 7)
    case 'biweekly':
      return addDays(fromDate, 14)
    case 'monthly':
      return addMonths(fromDate, 1)
    case 'quarterly':
      return addMonths(fromDate, 3)
    case 'biannual':
    case 'semiannual':
      return addMonths(fromDate, 6)
    case 'yearly':
    case 'annual':
      return addYears(fromDate, 1)
    default:
      // Try to parse as number of days
      const days = parseInt(recurrenceRule, 10)
      if (!isNaN(days)) {
        return addDays(fromDate, days)
      }
      return addMonths(fromDate, 1)
  }
}
