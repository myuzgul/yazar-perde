import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-perde-jwt-key-change-in-production-2026'
);

const ADMIN_COOKIE_NAME = 'perde_admin_token';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Sadece /panel altındaki sayfaları denetle (/panel/login hariç)
  if (pathname.startsWith('/panel') && pathname !== '/panel/login') {
    const adminToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;

    if (!adminToken) {
      const loginUrl = new URL('/panel/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(adminToken, JWT_SECRET);
      const role = (payload as any).role;

      // Normal üyelerin (CUSTOMER) yönetim paneline erişimini kesin olarak engelle
      if (role !== 'ADMIN' && role !== 'STAFF') {
        const loginUrl = new URL('/panel/login', req.url);
        loginUrl.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      // Geçersiz veya süresi dolmuş token
      const loginUrl = new URL('/panel/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/panel/:path*'],
};