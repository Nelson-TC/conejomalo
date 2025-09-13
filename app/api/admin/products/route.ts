import { NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';

export async function GET() {
	try {
		const products = await prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' } });
		return NextResponse.json(products);
	} catch {
		return NextResponse.json({ error: 'Error fetching products' }, { status: 500 });
	}
}

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { name, price, description, categoryId } = body;
		if (!name || !price || !categoryId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
		const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
		const product = await (prisma as any).product.create({ data: { name, slug, price, description, categoryId } });
		return NextResponse.json(product, { status: 201 });
	} catch {
		return NextResponse.json({ error: 'Error creating product' }, { status: 500 });
	}
}
