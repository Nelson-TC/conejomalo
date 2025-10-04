import { NextResponse } from 'next/server';
import { prisma } from '../../../../../src/lib/prisma';
import { requirePermission } from '../../../../../src/lib/permissions';
import { logAudit } from '../../../../../src/lib/audit';

function err(status: number, code: string, message?: string) { return NextResponse.json({ error: message || code, code }, { status }); }

interface Params { params: { id: string } }

export async function GET(_: Request, { params }: Params) {
  try {
    await requirePermission('order:read');
    const order = await prisma.order.findUnique({ where: { id: params.id }, include: { items: true, user: { select: { id: true, email: true } } } });
    if (!order) return err(404,'NOT_FOUND');
    return NextResponse.json(order);
  } catch (e:any) {
    if (e instanceof Error) {
      if (e.message === 'UNAUTHENTICATED') return err(401,'UNAUTHENTICATED');
      if (e.message === 'FORBIDDEN') return err(403,'FORBIDDEN');
    }
    return err(500,'SERVER_ERROR');
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    await requirePermission('order:manageStatus');
    const body = await req.json().catch(()=>({}));
    const nextStatusRaw = String(body.status || '').toUpperCase();
    const allowed = ['PENDING','PAID','SHIPPED','COMPLETED','CANCELED'];
    if (!allowed.includes(nextStatusRaw)) return err(400,'INVALID_STATUS');
    // Fetch current status via raw SQL to avoid missing type in generated client
    const current: any[] = await (prisma as any).$queryRawUnsafe('SELECT id, status FROM "Order" WHERE id = $1', params.id);
    if (!current.length) return err(404,'NOT_FOUND');
    const prev = current[0].status;
    if (prev === nextStatusRaw) return NextResponse.json({ ok: true, unchanged: true });
    await (prisma as any).$executeRawUnsafe('UPDATE "Order" SET status = $1 WHERE id = $2', nextStatusRaw, params.id);
    logAudit('order.status.update','Order', params.id, { from: prev, to: nextStatusRaw });
    return NextResponse.json({ ok: true, from: prev, to: nextStatusRaw });
  } catch (e:any) {
    if (e instanceof Error) {
      if (e.message === 'UNAUTHENTICATED') return err(401,'UNAUTHENTICATED');
      if (e.message === 'FORBIDDEN') return err(403,'FORBIDDEN');
    }
    return err(500,'SERVER_ERROR');
  }
}
