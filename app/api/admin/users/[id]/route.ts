import { NextResponse } from 'next/server';
import { prisma } from '../../../../../src/lib/prisma';

interface Params { params: { id: string } }

export async function GET(_: Request, { params }: Params) {
	try {
		const user = await prisma.user.findUnique({ where: { id: params.id } });
		if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
		return NextResponse.json(user);
	} catch { return NextResponse.json({ error: 'Error' }, { status: 500 }); }
}

export async function PUT(req: Request, { params }: Params) {
	try {
		const body = await req.json();
		const { name } = body;
		const user = await prisma.user.update({ where: { id: params.id }, data: { name } });
		return NextResponse.json(user);
	} catch { return NextResponse.json({ error: 'Error updating' }, { status: 500 }); }
}

export async function DELETE(_: Request, { params }: Params) {
	try {
		await prisma.user.delete({ where: { id: params.id } });
		return NextResponse.json({ ok: true });
	} catch { return NextResponse.json({ error: 'Error deleting' }, { status: 500 }); }
}
