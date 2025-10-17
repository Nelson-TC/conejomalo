import { NextResponse } from 'next/server';
import { prisma } from '../../../../../src/lib/prisma';
import { requirePermission, invalidatePermissions } from '../../../../../src/lib/permissions';
import { logAudit } from '../../../../../src/lib/audit';
import bcrypt from 'bcryptjs';

interface Params { params: { id: string } }

export async function GET(_: Request, { params }: Params) {
	try {
		await requirePermission('user:read');
		const user = await prisma.user.findUnique({ where: { id: params.id } });
		if (!user) return NextResponse.json({ error: 'Not found', code: 'NOT_FOUND' }, { status: 404 });
		const roles = await prisma.userRole.findMany({ where: { userId: user.id }, include: { role: true } });
		return NextResponse.json({ id: user.id, email: user.email, name: user.name, roles: roles.map(r=> r.role.name), createdAt: user.createdAt });
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
		const email = typeof body.email === 'string' && body.email.trim() ? String(body.email).trim() : undefined;
		const name = body.name !== undefined ? (body.name ? String(body.name).trim() : null) : undefined;
		const roles: string[] | undefined = Array.isArray(body.roles) ? body.roles.map((r:any)=> String(r)) : undefined;
		const password: string | undefined = typeof body.password === 'string' && body.password ? body.password : undefined;

		const data: any = {};
		if (email !== undefined) data.email = email;
		if (name !== undefined) data.name = name;
		if (password) data.passwordHash = await bcrypt.hash(password, 10);

		const user = await prisma.user.update({ where: { id: params.id }, data });
		if (roles) {
			await prisma.userRole.deleteMany({ where: { userId: user.id } });
			if (roles.length) {
				const roleRows = await prisma.roleEntity.findMany({ where: { name: { in: roles } }, select: { id: true } });
				if (roleRows.length) {
					await prisma.userRole.createMany({ data: roleRows.map(r=>({ userId: user.id, roleId: r.id })) });
				}
			}
		}
		invalidatePermissions(user.id);
		logAudit('user.update','User', user.id, { email, name, roles: roles ?? 'KEEP' });
		const assigned = await prisma.userRole.findMany({ where: { userId: user.id }, include: { role: true } });
		return NextResponse.json({ id: user.id, email: user.email, name: user.name, roles: assigned.map(a=> a.role.name), createdAt: user.createdAt });
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
