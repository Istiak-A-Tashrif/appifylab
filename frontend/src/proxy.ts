import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get('access_token')?.value || request.cookies.get('refresh_token')?.value);
  const path = request.nextUrl.pathname;
  if (path.startsWith('/feed') && !hasSession) return NextResponse.redirect(new URL('/login', request.url));
  if ((path === '/login' || path === '/register') && hasSession) return NextResponse.redirect(new URL('/feed', request.url));
  return NextResponse.next();
}

export const config = { matcher: ['/feed/:path*', '/login', '/register'] };
