import { type NextRequest, NextResponse } from 'next/server'
import { createClientForServer } from '@/utils/supabase/server'

export async function middleware(request: NextRequest) {
  // Skip middleware on API routes and other non-page routes
  if (request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.includes('.')) {
    return NextResponse.next()
  }

  // Create a Supabase client instance
  const supabase = await createClientForServer()

  // Get the user's authentication status
  const { data: { user } } = await supabase.auth.getUser()
  // console.log("🚀 ~ middleware ~ user:", user)

  const path = request.nextUrl.pathname

  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/register']

  // Check for Supabase auth cookie directly (either email/password or OAuth)
  const hasAuthCookie = request.cookies.has('sb-tevkpdkthxxeeejvzkwj-auth-token') ||
    request.cookies.has('sb-tevkpdkthxxeeejvzkwj-auth-token-code-verifier')

  // If there's an auth cookie present and user is on a public route, redirect to home
  if (hasAuthCookie && publicRoutes.includes(path)) {
    const dashboardUrl = new URL(`/dashboard`, request.url)
    // Prevent redirect loops by checking if we're already at the destination
    if (request.nextUrl.pathname !== dashboardUrl.pathname) {
      return NextResponse.redirect(dashboardUrl)
    }
  }

  // If the user is not authenticated and trying to access a restricted route
  if (!user && !publicRoutes.includes(path) && path !== '/') {
    const loginUrl = new URL('/login', request.url)
    // Prevent redirect loops
    if (request.nextUrl.pathname !== loginUrl.pathname) {
      return NextResponse.redirect(loginUrl)
    }
  }

  // If the user is authenticated and trying to access a public route
  if (user && publicRoutes.includes(path)) {
    const homeUrl = new URL(`/`, request.url)
    // Prevent redirect loops
    if (request.nextUrl.pathname !== homeUrl.pathname) {
      return NextResponse.redirect(homeUrl)
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