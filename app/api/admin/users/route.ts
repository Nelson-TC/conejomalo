import { NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';
import { requirePermission } from '../../../../src/lib/permissions';
import { logAudit } from '../../../../src/lib/audit';

function err(status: number, code: string, message?: string) { return NextResponse.json({ error: message || code, code }, { status }); }

export async function GET() {
	try {
		await requirePermission('user:read');
		const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
		return NextResponse.json(users);
	} catch (e: any) {
		if (e instanceof Error) {
			if (e.message === 'UNAUTHENTICATED') return err(401,'UNAUTHENTICATED');
			if (e.message === 'FORBIDDEN') return err(403,'FORBIDDEN');
		}
		return err(500,'SERVER_ERROR','Error fetching users');
	}
}

export async function POST(req: Request) {
	try {
		await requirePermission('user:create');
		const body = await req.json();
		const { email, name } = body;
		if (!email) return err(400,'EMAIL_REQUIRED','Email required');
		const user = await prisma.user.create({ data: { email, name } });
		logAudit('user.create','User', user.id, { email });
		return NextResponse.json(user, { status: 201 });
	} catch (e: any) {
		if (e instanceof Error) {
			if (e.message === 'UNAUTHENTICATED') return err(401,'UNAUTHENTICATED');
			if (e.message === 'FORBIDDEN') return err(403,'FORBIDDEN');
		}
		return err(500,'SERVER_ERROR','Error creating user');
	}
}
