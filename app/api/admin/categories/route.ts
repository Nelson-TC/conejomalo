import { NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';

export async function GET() {
	try {
		const categories = await prisma.category.findMany({ orderBy: { createdAt: 'desc' } });
		return NextResponse.json(categories);
	} catch (e) {
		return NextResponse.json({ error: 'Error fetching categories' }, { status: 500 });
	}
}

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { name, active = true } = body;
		if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
		const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
		const category = await (prisma as any).category.create({ data: { name, slug, active } });
		return NextResponse.json(category, { status: 201 });
	} catch (e: any) {
		return NextResponse.json({ error: 'Error creating category' }, { status: 500 });
	}
}
