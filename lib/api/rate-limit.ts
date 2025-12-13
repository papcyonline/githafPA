/**
 * Rate Limiting Utility for API Routes
 * Prevents abuse and ensures fair usage
 */

interface RateLimitConfig {
  interval: number // Time window in milliseconds
  maxRequests: number // Maximum requests per interval
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store for rate limiting (use Redis in production for multi-instance)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean up every minute

/**
 * Check if a request should be rate limited
 * @returns { success: boolean, remaining: number, resetIn: number }
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { interval: 60000, maxRequests: 60 }
): { success: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const key = identifier

  let entry = rateLimitStore.get(key)

  // If no entry or expired, create new one
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + config.interval,
    }
    rateLimitStore.set(key, entry)
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetIn: config.interval,
    }
  }

  // Increment count
  entry.count++
  rateLimitStore.set(key, entry)

  // Check if over limit
  const remaining = Math.max(0, config.maxRequests - entry.count)
  const resetIn = entry.resetTime - now

  return {
    success: entry.count <= config.maxRequests,
    remaining,
    resetIn,
  }
}

/**
 * Rate limit configurations for different endpoints
 */
export const rateLimitConfigs = {
  // Standard API endpoints
  default: { interval: 60000, maxRequests: 60 },

  // AI/expensive endpoints (more restrictive)
  ai: { interval: 60000, maxRequests: 20 },

  // Authentication endpoints
  auth: { interval: 300000, maxRequests: 10 }, // 10 per 5 minutes

  // File upload endpoints
  upload: { interval: 60000, maxRequests: 10 },

  // Search endpoints
  search: { interval: 60000, maxRequests: 30 },
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request, userId?: string): string {
  // Prefer user ID if authenticated
  if (userId) {
    return `user:${userId}`
  }

  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  return `ip:${ip}`
}

/**
 * Rate limit response headers
 */
export function getRateLimitHeaders(result: { remaining: number; resetIn: number }): HeadersInit {
  return {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetIn / 1000).toString(),
  }
}

/**
 * Create rate limited response
 */
export function rateLimitedResponse(resetIn: number): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil(resetIn / 1000),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': Math.ceil(resetIn / 1000).toString(),
      },
    }
  )
}

/**
 * Middleware-style rate limit check
 * Returns null if allowed, Response if rate limited
 */
export function withRateLimit(
  request: Request,
  userId?: string,
  config: RateLimitConfig = rateLimitConfigs.default
): Response | null {
  const identifier = getClientIdentifier(request, userId)
  const result = checkRateLimit(identifier, config)

  if (!result.success) {
    return rateLimitedResponse(result.resetIn)
  }

  return null
}
