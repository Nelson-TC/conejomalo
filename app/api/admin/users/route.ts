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
		const email = String(body.email||'').trim();
		const name = body.name? String(body.name).trim(): null;
		const roleIds: string[] = Array.isArray(body.roleIds)? body.roleIds.filter((r: any)=> typeof r === 'string') : [];
		if (!email) return err(400,'EMAIL_REQUIRED','Email required');
		const existing = await prisma.user.findUnique({ where: { email } });
		if (existing) return err(409,'USER_EXISTS','User already exists');
		const created = await prisma.user.create({ data: { email, name } });
		if (roleIds.length) {
			const validRoles = await prisma.roleEntity.findMany({ where: { id: { in: roleIds } }, select: { id: true } });
			if (validRoles.length) {
				await prisma.userRole.createMany({ data: validRoles.map(r=>({ userId: created.id, roleId: r.id })) });
			}
		}
		logAudit('user.create','User', created.id, { email, roleIds });
		return NextResponse.json(created, { status: 201 });
	} catch (e: any) {
		if (e instanceof Error) {
			if (e.message === 'UNAUTHENTICATED') return err(401,'UNAUTHENTICATED');
			if (e.message === 'FORBIDDEN') return err(403,'FORBIDDEN');
		}
		return err(500,'SERVER_ERROR','Error creating user');
	}
}
