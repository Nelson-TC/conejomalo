import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

async function verify(token: string) {
	try {
		const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me');
		const { payload } = await jwtVerify(token, secret);
		return payload as any;
	} catch {
		return null;
	}
}

export async function middleware(req: NextRequest) {
	if (req.nextUrl.pathname.startsWith('/admin')) {
		const token = req.cookies.get('session')?.value;
		if (!token) return NextResponse.redirect(new URL('/login', req.url));
		const payload = await verify(token);
		if (!payload || payload.role !== 'ADMIN') {
			return NextResponse.redirect(new URL('/login', req.url));
		}
	}
	return NextResponse.next();
}

export const config = {
	matcher: ['/admin/:path*']
};
