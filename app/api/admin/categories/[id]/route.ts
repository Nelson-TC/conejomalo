import { NextResponse } from 'next/server';
import { prisma } from '../../../../../src/lib/prisma';

interface Params { params: { id: string } }

export async function GET(_: Request, { params }: Params) {
	try {
		const category = await prisma.category.findUnique({ where: { id: params.id } });
		if (!category) return NextResponse.json({ error: 'Not found' }, { status: 404 });
		return NextResponse.json(category);
	} catch {
		return NextResponse.json({ error: 'Error' }, { status: 500 });
	}
}

export async function PUT(req: Request, { params }: Params) {
	try {
		const body = await req.json();
		const { name, active = true } = body;
		if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
		const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
		const category = await (prisma as any).category.update({ where: { id: params.id }, data: { name, slug, active } });
		return NextResponse.json(category);
	} catch {
		return NextResponse.json({ error: 'Error updating' }, { status: 500 });
	}
}

export async function DELETE(_: Request, { params }: Params) {
	try {
		await prisma.category.delete({ where: { id: params.id } });
		return NextResponse.json({ ok: true });
	} catch {
		return NextResponse.json({ error: 'Error deleting' }, { status: 500 });
	}
}
