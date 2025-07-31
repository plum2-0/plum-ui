import { auth } from "@/lib/auth-edge"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  // Protected routes that require authentication
  const protectedRoutes = ['/onboarding', '/dashboard', '/projects']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Redirect unauthenticated users trying to access protected routes
  if (!isLoggedIn && isProtectedRoute) {
    const signInUrl = new URL('/auth/signin', req.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Allow the request to continue
  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}