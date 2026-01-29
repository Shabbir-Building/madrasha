import { AdminRole } from '@/domain/admins';

import { NextResponse } from 'next/server';

type ProtectedRoute = {
  base: string;
  defaultRedirect?: string;
};

// Central list of protected areas and their default post-login destinations
export const PROTECTED_ROUTES: ProtectedRoute[] = [
  { base: '/dashboard', defaultRedirect: '/dashboard/students' },
  { base: '/dashboard/employees', defaultRedirect: '/dashboard/employees' },
  // Add more: { base: '/admin', defaultRedirect: '/admin/home' }
];

const AUTH_PAGES = ['/login'];

export const isProtectedPath = (pathname: string): boolean => {
  return PROTECTED_ROUTES.some((r) => pathname.startsWith(r.base));
};

export const isAuthPage = (pathname: string): boolean => {
  return AUTH_PAGES.includes(pathname);
};

export const buildRedirect = (reqUrl: string, target: string): NextResponse => {
  const url = new URL(target, reqUrl);
  const current = new URL(reqUrl);
  if (!isAuthPage(target)) {
    url.searchParams.set('callbackUrl', encodeURIComponent(current.pathname + current.search));
  }
  return NextResponse.redirect(url);
};

// Optional role guard mapping (extend when needed)
export const requiredRolesForPath = (pathname: string): number[] | undefined => {
  if (pathname === '/dashboard/overview' || pathname === '/dashboard/admins') {
    return [AdminRole.SUPER_ADMIN];
  }
  return undefined;
};

export const getDefaultAuthedRedirect = (): string => {
  const first = PROTECTED_ROUTES[0];
  return first?.defaultRedirect ?? first?.base ?? '/';
};

// Decode a JWT and check its exp claim using base64url decoding
export const isJwtExpired = (jwt: string | undefined | null): boolean => {
  if (!jwt || typeof jwt !== 'string') return true;
  const parts = jwt.split('.');
  if (parts.length < 2) return true;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    // Use atob in Edge runtime; fall back to Buffer in Node.
    const decoded =
      typeof atob === 'function'
        ? atob(base64)
        : (globalThis as unknown as { Buffer?: typeof Buffer }).Buffer
          ? Buffer.from(base64, 'base64').toString('utf8')
          : '';
    if (!decoded) return true;
    const payload = JSON.parse(decoded) as { exp?: number };
    const exp = typeof payload.exp === 'number' ? payload.exp : 0;
    if (exp === 0) return false; // no exp means treat as non-expiring token
    return exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};
