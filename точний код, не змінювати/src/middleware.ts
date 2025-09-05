
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Assume a cookie `auth_token` signifies authentication
  // const authToken = request.cookies.get('auth_token');
  // const { pathname } = request.nextUrl;

  // // If user is not authenticated and is not on the login or company selection page, redirect them to login
  // if (!authToken && pathname !== '/login' && pathname !== '/select-company') {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  // // If user is authenticated and tries to access the login page, redirect them to the home page
  // if (authToken && pathname === '/login') {
  //   return NextResponse.redirect(new URL('/', request.url));
  // }
  
  // // The logic for company selection redirect is handled client-side after login.
  // // Middleware cannot access localStorage, so we don't check for selectedCompany here.

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
