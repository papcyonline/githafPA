/**
 * Audio Transcription API Route
 * Uses server-side OpenAI client (secure)
 */

import { NextRequest } from 'next/server'
import { transcribeAudio } from '@/lib/api/openai'
import {
  transcribeRequestSchema,
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
    const validation = safeValidateRequest(transcribeRequestSchema, body)
    if (!validation.success) {
      const { error } = validation as { success: false; error: import('zod').ZodError }
      return validationError(
        'Invalid request',
        formatValidationErrors(error)
      )
    }

    const { audioUrl, language } = validation.data

    // Download audio file
    const audioResponse = await fetch(audioUrl)
    if (!audioResponse.ok) {
      return validationError('Failed to fetch audio file')
    }

    const audioBlob = await audioResponse.blob()

    // Validate file size (max 25MB for Whisper)
    const maxSize = 25 * 1024 * 1024
    if (audioBlob.size > maxSize) {
      return validationError('Audio file too large (max 25MB)')
    }

    // Transcribe using server-side OpenAI client
    const transcript = await transcribeAudio(audioBlob, { language })

    return successResponse({ transcript })
  })
}
