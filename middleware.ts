import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Lightweight JWT verify (matches app auth). Returns payload or null.
async function verify(token: string) {
	try {
		const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me');
		const { payload } = await jwtVerify(token, secret);
		return payload as any;
	} catch {
		return null;
	}
}

// NOTE: Prisma Client cannot run in middleware (Edge runtime). We only perform
// authentication here; fine‑grained permission checks happen in API routes and
// server components using requirePermission / getUserPermissions.

export async function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;
	const isProtected = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
	if (!isProtected) return NextResponse.next();

	const token = req.cookies.get('session')?.value;
	if (!token) {
		// For page routes redirect to login; for api respond 401 JSON
		if (pathname.startsWith('/api')) {
			return NextResponse.json({ error: 'Unauthenticated', code: 'UNAUTHENTICATED' }, { status: 401 });
		}
		const loginUrl = new URL('/login', req.url);
		loginUrl.searchParams.set('from', pathname);
		return NextResponse.redirect(loginUrl);
	}
	const payload = await verify(token);
	const userId = payload?.sub;
	if (!userId) {
		if (pathname.startsWith('/api')) {
			return NextResponse.json({ error: 'Unauthenticated', code: 'UNAUTHENTICATED' }, { status: 401 });
		}
		return NextResponse.redirect(new URL('/login', req.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/admin/:path*', '/api/admin/:path*']
};
