/**
 * API Authentication Utilities
 * Single Responsibility: Handle authentication for API routes
 *
 * Open/Closed Principle: Easy to extend with new auth methods
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { formatValidationErrors } from './validation'

// Server-side Supabase client with service role key
function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

export const serverSupabase = getServerSupabase()

/**
 * Authentication result
 */
export interface AuthResult {
  authenticated: boolean
  userId?: string
  error?: string
}

/**
 * Extract and verify user from request
 * Checks Authorization header or cookie
 */
export async function authenticateRequest(req: NextRequest): Promise<AuthResult> {
  try {
    // Try Authorization header first
    const authHeader = req.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const { data: { user }, error } = await serverSupabase.auth.getUser(token)

      if (error || !user) {
        return { authenticated: false, error: 'Invalid token' }
      }

      return { authenticated: true, userId: user.id }
    }

    // Try to get user from session cookie (for browser requests)
    const supabaseAuthCookie = req.cookies.get('sb-access-token')?.value
    if (supabaseAuthCookie) {
      const { data: { user }, error } = await serverSupabase.auth.getUser(supabaseAuthCookie)

      if (!error && user) {
        return { authenticated: true, userId: user.id }
      }
    }

    // For development/testing, check if user_id is passed in body or query
    // This should be removed in production
    if (process.env.NODE_ENV === 'development') {
      const url = new URL(req.url)
      const queryUserId = url.searchParams.get('user_id')
      if (queryUserId && isValidUUID(queryUserId)) {
        return { authenticated: true, userId: queryUserId }
      }
    }

    return { authenticated: false, error: 'No authentication provided' }
  } catch (error) {
    console.error('Authentication error:', error)
    return { authenticated: false, error: 'Authentication failed' }
  }
}

/**
 * Middleware wrapper for authenticated API routes
 * Dependency Inversion: Handler receives auth context, doesn't manage it
 */
export function withAuth<T>(
  handler: (req: NextRequest, userId: string) => Promise<NextResponse<T>>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const auth = await authenticateRequest(req)

    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: 401 }
      )
    }

    return handler(req, auth.userId)
  }
}

/**
 * Middleware wrapper with validation
 * Combines auth and body validation
 */
export function withAuthAndValidation<TBody, TResponse>(
  schema: z.ZodSchema<TBody>,
  handler: (req: NextRequest, userId: string, body: TBody) => Promise<NextResponse<TResponse>>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Authenticate
    const auth = await authenticateRequest(req)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate body
    try {
      const body = await req.json()
      const result = schema.safeParse(body)

      if (!result.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: formatValidationErrors(result.error)
          },
          { status: 400 }
        )
      }

      return handler(req, auth.userId, result.data)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }
  }
}

// Helper functions
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}
