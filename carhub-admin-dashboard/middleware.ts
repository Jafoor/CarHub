// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAuthenticated } from './lib/auth';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');

  // Check if user has a valid token
  const hasValidToken = token && isAuthenticated();

  // If user is authenticated and trying to access login, redirect to dashboard
  if (hasValidToken && isAuthPage) {
    // Don't redirect if there's a redirect parameter (to avoid loops)
    const redirectParam = request.nextUrl.searchParams.get('redirect');
    if (!redirectParam) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // If there's a redirect param, let the login page handle it
    return NextResponse.next();
  }

  // If user is not authenticated and trying to access dashboard, redirect to login
  if (!hasValidToken && isDashboardPage) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
  ],
};