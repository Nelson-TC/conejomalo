import { NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';
import { requirePermission } from '../../../../src/lib/permissions';

function err(status: number, code: string, message?: string) { return NextResponse.json({ error: message || code, code }, { status }); }

export async function GET(req: Request) {
  try {
    await requirePermission('order:read');
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    const status = searchParams.get('status');
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10) || 20, 1), 100);
    const where: any = {};
    if (q) {
      where.OR = [
        { id: { contains: q } },
        { customer: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } }
      ];
    }
    if (status) where.status = status.toUpperCase();

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { items: true }
      })
    ]);

    return NextResponse.json({ total, page, pageSize, orders });
  } catch (e:any) {
    if (e instanceof Error) {
      if (e.message === 'UNAUTHENTICATED') return err(401,'UNAUTHENTICATED');
      if (e.message === 'FORBIDDEN') return err(403,'FORBIDDEN');
    }
    return err(500,'SERVER_ERROR');
  }
}
