import { getToken } from 'next-auth/jwt';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import {
  buildRedirect,
  getDefaultAuthedRedirect,
  isAuthPage,
  isJwtExpired,
  isProtectedPath,
  requiredRolesForPath,
} from './lib/auth-middleware';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  // Token here is the NextAuth JWT; we store backend accessToken on it
  // Redirect authenticated users away from auth pages
  if (isAuthPage(pathname)) {
    const accessToken = (token as unknown as { accessToken?: string })?.accessToken;
    if (token && accessToken && !isJwtExpired(accessToken)) {
      const target = getDefaultAuthedRedirect();
      return NextResponse.redirect(new URL(target, req.url));
    }
    return NextResponse.next();
  }

  // Protect app pages
  if (isProtectedPath(pathname)) {
    const accessToken = (token as unknown as { accessToken?: string })?.accessToken;
    if (!token || !accessToken || isJwtExpired(accessToken)) {
      return buildRedirect(req.url, '/login');
    }

    // Optional role checks can be re-enabled later
    const required = requiredRolesForPath(pathname);
    if (required && token?.admin && typeof token.admin.role === 'number') {
      if (!required.includes(token.admin.role)) {
        return NextResponse.redirect(new URL('/dashboard/students', req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
