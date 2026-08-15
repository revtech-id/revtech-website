import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Proxy (formerly Middleware) — server-side route protection.
 * Runs BEFORE the page renders, preventing unauthorized access.
 *
 * Strategy:
 * - Check for presence of _auth_token cookie set by UserContext on login.
 * - This is a lightweight "is logged in?" gate.
 * - Full role-based checks are enforced in layout.tsx (client)
 *   and API routes (server with Admin SDK).
 */

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard /admin/* routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Allow the change-password page (needed right after login)
  if (pathname === '/admin/change-password') {
    return NextResponse.next();
  }

  // Check for session cookie set by UserContext after login
  const hasSession = request.cookies.has('_auth_token');

  if (!hasSession) {
    const loginUrl = new URL('/admin-revtech', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
