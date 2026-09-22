import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes are protected by client-side ProtectedRoute component
  // No server-side middleware needed since tokens are in localStorage
  
  console.log('Middleware - Path:', pathname);

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/auth/:path*'],
};
