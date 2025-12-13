/**
 * API Validation Schemas using Zod
 * Single Responsibility: Define and validate all API input schemas
 *
 * Benefits:
 * - Type-safe validation
 * - Auto-generated TypeScript types
 * - Consistent error messages
 */

import { z } from 'zod'

// ============================================
// Common Schemas
// ============================================

export const uuidSchema = z.string().uuid('Invalid ID format')

export const dateSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  'Date must be in YYYY-MM-DD format'
)

export const timeSchema = z.string().regex(
  /^\d{2}:\d{2}$/,
  'Time must be in HH:MM format'
)

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

// ============================================
// Transcription Schemas
// ============================================

export const transcribeRequestSchema = z.object({
  audioUrl: z.string().url('Valid audio URL is required'),
  language: z.string().length(2).optional().default('en'),
})

export type TranscribeRequest = z.infer<typeof transcribeRequestSchema>

// ============================================
// Voice Command Schemas
// ============================================

export const parseCommandRequestSchema = z.object({
  transcript: z.string().min(1, 'Transcript is required').max(5000),
  context: z.enum([
    'finance',
    'documents',
    'checkin',
    'personal',
    'life-tasks',
    ''
  ]).optional(),
})

export type ParseCommandRequest = z.infer<typeof parseCommandRequestSchema>

// ============================================
// Financial Entry Schemas
// ============================================

export const financialEntrySchema = z.object({
  entry_type: z.enum(['income', 'expense', 'transfer', 'investment']),
  amount: z.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required').max(50),
  description: z.string().max(500).optional(),
  date: dateSchema,
  user_id: uuidSchema,
  is_recurring: z.boolean().optional().default(false),
  recurrence_interval: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
})

export const createFinancialEntrySchema = financialEntrySchema

export const updateFinancialEntrySchema = financialEntrySchema.partial().extend({
  id: uuidSchema,
})

export type FinancialEntry = z.infer<typeof financialEntrySchema>
export type CreateFinancialEntry = z.infer<typeof createFinancialEntrySchema>
export type UpdateFinancialEntry = z.infer<typeof updateFinancialEntrySchema>

// ============================================
// Reminder Schemas
// ============================================

export const reminderSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  due_date: dateSchema,
  due_time: timeSchema.optional(),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  is_completed: z.boolean().optional().default(false),
  user_id: uuidSchema,
})

export type Reminder = z.infer<typeof reminderSchema>

// ============================================
// Task Schemas
// ============================================

export const taskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  due_date: dateSchema.optional(),
  due_time: timeSchema.optional(),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  completed: z.boolean().optional().default(false),
  user_id: uuidSchema,
})

export type Task = z.infer<typeof taskSchema>

// ============================================
// Note Schemas
// ============================================

export const noteSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().max(10000),
  user_id: uuidSchema,
  tags: z.array(z.string().max(50)).max(10).optional(),
})

export type Note = z.infer<typeof noteSchema>

// ============================================
// Daily Check-in Schemas
// ============================================

export const checkinSchema = z.object({
  user_id: uuidSchema,
  date: dateSchema,
  mood_score: z.number().min(1).max(5),
  energy_level: z.number().min(1).max(5),
  stress_level: z.number().min(1).max(5),
  sleep_quality: z.number().min(1).max(5).optional(),
  sleep_hours: z.number().min(0).max(24).optional(),
  gratitude: z.string().max(1000).optional(),
  wins: z.string().max(1000).optional(),
  challenges: z.string().max(1000).optional(),
  notes: z.string().max(2000).optional(),
})

export type Checkin = z.infer<typeof checkinSchema>

// ============================================
// Personal Event Schemas
// ============================================

export const personalEventSchema = z.object({
  user_id: uuidSchema,
  event_type: z.enum(['birthday', 'anniversary', 'memorial', 'holiday', 'other']),
  person_name: z.string().min(1).max(100),
  date: dateSchema,
  year: z.number().min(1900).max(2100).optional(),
  notes: z.string().max(1000).optional(),
  gift_ideas: z.array(z.string().max(200)).max(10).optional(),
  reminder_days_before: z.number().min(0).max(365).optional().default(7),
})

export type PersonalEvent = z.infer<typeof personalEventSchema>

// ============================================
// Life Task Schemas
// ============================================

export const lifeTaskSchema = z.object({
  user_id: uuidSchema,
  title: z.string().min(1).max(200),
  category: z.enum(['health', 'finance', 'home', 'vehicle', 'documents', 'insurance', 'other']),
  description: z.string().max(1000).optional(),
  due_date: dateSchema.optional(),
  recurrence: z.enum(['once', 'monthly', 'quarterly', 'yearly']).optional().default('once'),
  is_completed: z.boolean().optional().default(false),
  last_completed: dateSchema.optional(),
  reminder_days_before: z.number().min(0).max(365).optional().default(7),
})

export type LifeTask = z.infer<typeof lifeTaskSchema>

// ============================================
// Validation Helper
// ============================================

/**
 * Validate request body against a schema
 * Returns validated data or throws ZodError
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  return schema.parse(data)
}

type ValidationSuccess<T> = { success: true; data: T }
type ValidationFailure = { success: false; error: z.ZodError }
type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure

/**
 * Safe validation that returns result object instead of throwing
 */
export function safeValidateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data } as ValidationSuccess<T>
  }
  return { success: false, error: result.error } as ValidationFailure
}

/**
 * Check if validation result is a failure
 */
export function isValidationFailure<T>(
  result: ValidationResult<T>
): result is ValidationFailure {
  return !result.success
}

/**
 * Format Zod errors into user-friendly messages
 */
export function formatValidationErrors(error: z.ZodError): string[] {
  return error.issues.map(err => {
    const path = err.path.join('.')
    return path ? `${path}: ${err.message}` : err.message
  })
}
