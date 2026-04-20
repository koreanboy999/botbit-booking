import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secretKey = process.env.JWT_SECRET || 'botbit_fallback_secret_key_2026'
const key = new TextEncoder().encode(secretKey)

export async function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname
  
  // Public Paths
  if (currentPath === '/login' || currentPath.startsWith('/api/') || currentPath.startsWith('/_next/') || currentPath === '/favicon.ico') {
    return NextResponse.next()
  }

  const sessionCookie = request.cookies.get('session')?.value

  if (!sessionCookie) {
    if (currentPath === '/') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const { payload } = await jwtVerify(sessionCookie, key)
    const role = payload.role as string

    // Root redirect
    if (currentPath === '/') {
      if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin', request.url))
      return NextResponse.redirect(new URL('/leader', request.url))
    }

    // Protect /admin routes
    if (currentPath.startsWith('/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/leader', request.url))
    }

    // Protect /leader routes
    if (currentPath.startsWith('/leader') && role !== 'LEADER') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    return NextResponse.next()
  } catch {
    // Invalid token
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('session')
    return response
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
