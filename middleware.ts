import { type NextRequest, NextResponse } from 'next/server'
import { createClientForServer } from '@/utils/supabase/server'

export async function middleware(request: NextRequest) {
  // Skip middleware on API routes and other non-page routes
  if (request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.includes('.') ||
    request.nextUrl.pathname.startsWith('/callback')) {
    return NextResponse.next()
  }

  const path = request.nextUrl.pathname

  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/signup-success', '/error', '/auth/auth-code-error', '/', '/callback']

  // Create a Supabase client instance
  const supabase = await createClientForServer()

  // Get the user's authentication status
  const { data: { user } } = await supabase.auth.getUser()

  // If the user is not authenticated and trying to access a restricted route
  if (!user && !publicRoutes.includes(path) && path !== '/') {
    const loginUrl = new URL('/login', request.url)
    // Prevent redirect loops
    if (request.nextUrl.pathname !== loginUrl.pathname) {
      return NextResponse.redirect(loginUrl)
    }
  }

  // Otherwise, proceed with the request
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/ (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, assets, etc.)
     */
    '/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|js|css)$).*)',
  ],
}