import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './routing';

const intlMiddleware = createIntlMiddleware(routing);
const SECRET = process.env.ADMIN_SESSION_SECRET || 'dekanic_admin_2024';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip for API and static files
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Admin routes — bypass intl middleware entirely
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/setup') return NextResponse.next();
    if (pathname === '/admin/login') return NextResponse.next();
    const session = req.cookies.get('admin_session');
    if (!session || !session.value.endsWith(`_${SECRET}`)) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    return NextResponse.next();
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\..*).*)'],
};
