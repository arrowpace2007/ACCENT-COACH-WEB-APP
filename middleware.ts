import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimiter } from './lib/security/rate-limiter'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const userAgent = request.headers.get('user-agent') || ''

  // Security headers for all requests
  const response = NextResponse.next()
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    try {
      const rateLimitResult = await rateLimiter.checkApiLimit(ip)
      
      if (!rateLimitResult.allowed) {
        return new NextResponse(
          JSON.stringify({
            error: 'Rate limit exceeded',
            retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
              'X-RateLimit-Limit': '100',
              'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
              'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
            },
          }
        )
      }

      // Add rate limit headers to successful requests
      response.headers.set('X-RateLimit-Limit', '100')
      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
      response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString())

    } catch (error) {
      console.error('Rate limiting error:', error)
      // Continue without rate limiting if there's an error
    }
  }

  // Special handling for audio analysis endpoints
  if (pathname === '/api/analyze-audio') {
    // Additional security for audio processing
    response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp')
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
    
    // Validate content type for audio uploads
    if (request.method === 'POST') {
      const contentType = request.headers.get('content-type')
      if (!contentType?.includes('multipart/form-data')) {
        return new NextResponse(
          JSON.stringify({ error: 'Invalid content type for audio upload' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }
    }
  }

  // Auth rate limiting
  if (pathname.startsWith('/api/auth/') || pathname.startsWith('/auth/')) {
    try {
      const authRateLimit = await rateLimiter.checkAuthLimit(ip)
      
      if (!authRateLimit.allowed) {
        return new NextResponse(
          JSON.stringify({
            error: 'Too many authentication attempts',
            retryAfter: Math.ceil((authRateLimit.resetTime - Date.now()) / 1000)
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': Math.ceil((authRateLimit.resetTime - Date.now()) / 1000).toString(),
            },
          }
        )
      }
    } catch (error) {
      console.error('Auth rate limiting error:', error)
    }
  }

  // Bot detection and blocking
  if (this.isBot(userAgent) && !this.isAllowedBot(userAgent)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // Geo-blocking (if needed)
  const country = request.headers.get('cf-ipcountry') || request.geo?.country
  if (country && this.isBlockedCountry(country)) {
    return new NextResponse('Service not available in your region', { status: 451 })
  }

  return response
}

// Helper functions
function isBot(userAgent: string): boolean {
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
  ]
  
  return botPatterns.some(pattern => pattern.test(userAgent))
}

function isAllowedBot(userAgent: string): boolean {
  const allowedBots = [
    /googlebot/i,
    /bingbot/i,
    /slurp/i,
    /duckduckbot/i,
    /baiduspider/i,
    /yandexbot/i,
    /facebookexternalhit/i,
    /twitterbot/i,
    /linkedinbot/i,
  ]
  
  return allowedBots.some(pattern => pattern.test(userAgent))
}

function isBlockedCountry(country: string): boolean {
  // Add countries to block if needed
  const blockedCountries: string[] = []
  return blockedCountries.includes(country.toUpperCase())
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}