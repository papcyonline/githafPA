/**
 * API Response Utilities
 * Single Responsibility: Standardize API responses
 *
 * Benefits:
 * - Consistent response format across all endpoints
 * - Type-safe responses
 * - Easy error handling
 */

import { NextResponse } from 'next/server'

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: string[]
  meta?: {
    page?: number
    limit?: number
    total?: number
    hasMore?: boolean
  }
}

/**
 * Success response helper
 */
export function successResponse<T>(
  data: T,
  meta?: ApiResponse<T>['meta'],
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta && { meta }),
    },
    { status }
  )
}

/**
 * Created response (201)
 */
export function createdResponse<T>(data: T): NextResponse<ApiResponse<T>> {
  return successResponse(data, undefined, 201)
}

/**
 * Error response helper
 */
export function errorResponse(
  message: string,
  status = 500,
  details?: string[]
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details && { details }),
    },
    { status }
  )
}

/**
 * Validation error (400)
 */
export function validationError(
  message: string,
  details?: string[]
): NextResponse<ApiResponse<never>> {
  return errorResponse(message, 400, details)
}

/**
 * Unauthorized error (401)
 */
export function unauthorizedError(
  message = 'Unauthorized'
): NextResponse<ApiResponse<never>> {
  return errorResponse(message, 401)
}

/**
 * Forbidden error (403)
 */
export function forbiddenError(
  message = 'Forbidden'
): NextResponse<ApiResponse<never>> {
  return errorResponse(message, 403)
}

/**
 * Not found error (404)
 */
export function notFoundError(
  message = 'Resource not found'
): NextResponse<ApiResponse<never>> {
  return errorResponse(message, 404)
}

/**
 * Internal server error (500)
 */
export function serverError(
  message = 'Internal server error',
  error?: unknown
): NextResponse<ApiResponse<never>> {
  // Log the actual error for debugging
  if (error) {
    console.error('Server error:', error)
  }

  return errorResponse(message, 500)
}

/**
 * Handle async route errors
 * Wrap route handlers to catch and format errors consistently
 */
export function withErrorHandling<T>(
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T | ApiResponse<never>>> {
  return handler().catch((error: unknown) => {
    console.error('Unhandled route error:', error)

    const message = error instanceof Error ? error.message : 'An unexpected error occurred'

    return serverError(message, error)
  })
}

/**
 * Paginated response helper
 */
export function paginatedResponse<T>(
  data: T[],
  options: {
    page: number
    limit: number
    total: number
  }
): NextResponse<ApiResponse<T[]>> {
  const { page, limit, total } = options
  const hasMore = page * limit < total

  return successResponse(data, {
    page,
    limit,
    total,
    hasMore,
  })
}
