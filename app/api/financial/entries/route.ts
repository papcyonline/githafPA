/**
 * Financial Entries API Route
 * With authentication and validation
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { serverSupabase, withAuth, withAuthAndValidation } from '@/lib/api/auth'
import {
  createFinancialEntrySchema,
  updateFinancialEntrySchema,
  paginationSchema,
  safeValidateRequest,
  formatValidationErrors,
  uuidSchema,
  dateSchema
} from '@/lib/api/validation'
import {
  successResponse,
  createdResponse,
  validationError,
  notFoundError,
  serverError,
  paginatedResponse
} from '@/lib/api/response'

// Query params schema
const getEntriesQuerySchema = z.object({
  type: z.enum(['income', 'expense', 'transfer', 'investment']).optional(),
  category: z.string().optional(),
  dateFrom: dateSchema.optional(),
  dateTo: dateSchema.optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

/**
 * GET /api/financial/entries
 * List financial entries with filters and pagination
 */
export const GET = withAuth(async (req, userId) => {
  const { searchParams } = new URL(req.url)

  // Parse query params
  const queryResult = safeValidateRequest(getEntriesQuerySchema, {
    type: searchParams.get('type') || undefined,
    category: searchParams.get('category') || undefined,
    dateFrom: searchParams.get('dateFrom') || undefined,
    dateTo: searchParams.get('dateTo') || undefined,
    page: searchParams.get('page') || 1,
    limit: searchParams.get('limit') || 20,
  })

  if (!queryResult.success) {
    const { error } = queryResult as { success: false; error: import('zod').ZodError }
    return validationError('Invalid query parameters', formatValidationErrors(error))
  }

  const { type, category, dateFrom, dateTo, page, limit } = queryResult.data
  const offset = (page - 1) * limit

  try {
    // Build query with user filter (security!)
    let query = serverSupabase
      .from('financial_entries')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (type) query = query.eq('entry_type', type)
    if (category) query = query.eq('category', category)
    if (dateFrom) query = query.gte('date', dateFrom)
    if (dateTo) query = query.lte('date', dateTo)

    // Pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw error

    return paginatedResponse(data || [], {
      page,
      limit,
      total: count || 0,
    })
  } catch (error) {
    console.error('Get financial entries error:', error)
    return serverError('Failed to fetch entries')
  }
})

// Create entry schema (without user_id, we'll add it)
const createEntryBodySchema = createFinancialEntrySchema.omit({ user_id: true })

/**
 * POST /api/financial/entries
 * Create a new financial entry
 */
export const POST = withAuthAndValidation(
  createEntryBodySchema,
  async (req, userId, body) => {
    try {
      const { data, error } = await serverSupabase
        .from('financial_entries')
        .insert({ ...body, user_id: userId })
        .select()
        .single()

      if (error) throw error

      return createdResponse({ entry: data })
    } catch (error) {
      console.error('Create financial entry error:', error)
      return serverError('Failed to create entry')
    }
  }
)

// Update entry schema
const updateEntryBodySchema = z.object({
  id: uuidSchema,
  entry_type: z.enum(['income', 'expense', 'transfer', 'investment']).optional(),
  amount: z.number().positive().optional(),
  category: z.string().min(1).max(50).optional(),
  description: z.string().max(500).optional(),
  date: dateSchema.optional(),
})

/**
 * PUT /api/financial/entries
 * Update an existing financial entry
 */
export const PUT = withAuthAndValidation(
  updateEntryBodySchema,
  async (req, userId, body) => {
    const { id, ...updates } = body

    try {
      // Verify ownership before update
      const { data: existing } = await serverSupabase
        .from('financial_entries')
        .select('id')
        .eq('id', id)
        .eq('user_id', userId)
        .single()

      if (!existing) {
        return notFoundError('Entry not found')
      }

      const { data, error } = await serverSupabase
        .from('financial_entries')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      return successResponse({ entry: data })
    } catch (error) {
      console.error('Update financial entry error:', error)
      return serverError('Failed to update entry')
    }
  }
)

/**
 * DELETE /api/financial/entries
 * Delete a financial entry
 */
export const DELETE = withAuth(async (req, userId) => {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return validationError('Entry ID is required')
  }

  const idValidation = safeValidateRequest(uuidSchema, id)
  if (!idValidation.success) {
    return validationError('Invalid entry ID')
  }

  try {
    // Verify ownership before delete
    const { data: existing } = await serverSupabase
      .from('financial_entries')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (!existing) {
      return notFoundError('Entry not found')
    }

    const { error } = await serverSupabase
      .from('financial_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error

    return successResponse({ deleted: true })
  } catch (error) {
    console.error('Delete financial entry error:', error)
    return serverError('Failed to delete entry')
  }
})
