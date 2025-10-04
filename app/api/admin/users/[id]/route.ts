import { NextResponse } from 'next/server';
import { prisma } from '../../../../../src/lib/prisma';
import { requirePermission, invalidatePermissions } from '../../../../../src/lib/permissions';
import { logAudit } from '../../../../../src/lib/audit';

interface Params { params: { id: string } }

export async function GET(_: Request, { params }: Params) {
	try {
		await requirePermission('user:read');
		const user = await prisma.user.findUnique({ where: { id: params.id } });
		if (!user) return NextResponse.json({ error: 'Not found', code: 'NOT_FOUND' }, { status: 404 });
		return NextResponse.json(user);
	} catch (e: any) {
		if (e instanceof Error) {
			if (e.message === 'UNAUTHENTICATED') return NextResponse.json({ error: 'Unauthenticated', code: 'UNAUTHENTICATED' }, { status: 401 });
			if (e.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 });
		}
		return NextResponse.json({ error: 'Error', code: 'SERVER_ERROR' }, { status: 500 });
	}
}

export async function PUT(req: Request, { params }: Params) {
	try {
		await requirePermission('user:update');
		const body = await req.json();
		const name = body.name? String(body.name).trim(): null;
		const roleIds: string[] = Array.isArray(body.roleIds)? body.roleIds.filter((r:any)=> typeof r === 'string') : [];
		const user = await prisma.user.update({ where: { id: params.id }, data: { name } });
		// Sync roles: remove all then add present (simple approach; could diff if needed)
		await prisma.userRole.deleteMany({ where: { userId: user.id } });
		if (roleIds.length) {
			const validRoles = await prisma.roleEntity.findMany({ where: { id: { in: roleIds } }, select: { id: true } });
			if (validRoles.length) {
				await prisma.userRole.createMany({ data: validRoles.map(r=>({ userId: user.id, roleId: r.id })) });
			}
		}
		// Invalidar caché de permisos para que próximos fetch /api/auth/me reflejen roles
		invalidatePermissions(user.id);
		logAudit('user.update','User', user.id, { name, roleIds });
		return NextResponse.json(user);
	} catch (e: any) {
		if (e instanceof Error) {
			if (e.message === 'UNAUTHENTICATED') return NextResponse.json({ error: 'Unauthenticated', code: 'UNAUTHENTICATED' }, { status: 401 });
			if (e.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 });
		}
		return NextResponse.json({ error: 'Error updating', code: 'SERVER_ERROR' }, { status: 500 });
	}
}

export async function DELETE(_: Request, { params }: Params) {
	try {
		await requirePermission('user:delete');
		await prisma.user.delete({ where: { id: params.id } });
		logAudit('user.delete','User', params.id);
		return NextResponse.json({ ok: true });
	} catch (e: any) {
		if (e instanceof Error) {
			if (e.message === 'UNAUTHENTICATED') return NextResponse.json({ error: 'Unauthenticated', code: 'UNAUTHENTICATED' }, { status: 401 });
			if (e.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 });
		}
		return NextResponse.json({ error: 'Error deleting', code: 'SERVER_ERROR' }, { status: 500 });
	}
}
