import { NextResponse } from 'next/server';
import { prisma } from '../../../../../src/lib/prisma';

interface Params { params: { id: string } }

export async function GET(_: Request, { params }: Params) {
	try {
		const product = await prisma.product.findUnique({ where: { id: params.id } });
		if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
		return NextResponse.json(product);
	} catch {
		return NextResponse.json({ error: 'Error' }, { status: 500 });
	}
}

export async function PUT(req: Request, { params }: Params) {
	try {
		const body = await req.json();
		const { name, price, description, categoryId } = body;
		if (!name || !price || !categoryId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
		const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
		const product = await (prisma as any).product.update({ where: { id: params.id }, data: { name, slug, price, description, categoryId } });
		return NextResponse.json(product);
	} catch {
		return NextResponse.json({ error: 'Error updating' }, { status: 500 });
	}
}

export async function DELETE(_: Request, { params }: Params) {
	try {
		await prisma.product.delete({ where: { id: params.id } });
		return NextResponse.json({ ok: true });
	} catch {
		return NextResponse.json({ error: 'Error deleting' }, { status: 500 });
	}
}
