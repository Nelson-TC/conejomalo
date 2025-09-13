import { NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';

export async function GET() {
	try {
		const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
		return NextResponse.json(users);
	} catch {
		return NextResponse.json({ error: 'Error fetching users' }, { status: 500 });
	}
}

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { email, name } = body;
		if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });
		const user = await prisma.user.create({ data: { email, name } });
		return NextResponse.json(user, { status: 201 });
	} catch {
		return NextResponse.json({ error: 'Error creating user' }, { status: 500 });
	}
}
