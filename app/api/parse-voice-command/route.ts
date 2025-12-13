/**
 * Voice Command Parsing API Route
 * Uses server-side OpenAI client (secure)
 */

import { NextRequest } from 'next/server'
import { parseVoiceCommand } from '@/lib/api/openai'
import {
  parseCommandRequestSchema,
  safeValidateRequest,
  formatValidationErrors
} from '@/lib/api/validation'
import {
  successResponse,
  validationError,
  withErrorHandling
} from '@/lib/api/response'
import { withRateLimit, rateLimitConfigs } from '@/lib/api/rate-limit'

export async function POST(request: NextRequest) {
  // Apply rate limiting for AI endpoints (more restrictive)
  const rateLimitResponse = withRateLimit(request, undefined, rateLimitConfigs.ai)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  return withErrorHandling(async () => {
    const body = await request.json()

    // Validate request
    const validation = safeValidateRequest(parseCommandRequestSchema, body)
    if (!validation.success) {
      const { error } = validation as { success: false; error: import('zod').ZodError }
      return validationError(
        'Invalid request',
        formatValidationErrors(error)
      )
    }

    const { transcript, context } = validation.data

    // Parse command using server-side OpenAI client
    const parsed = await parseVoiceCommand(transcript, context)

    return successResponse(parsed)
  })
}
