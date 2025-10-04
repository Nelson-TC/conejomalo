import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../src/lib/prisma';
import { requirePermission, invalidatePermissions } from '../../../../../../src/lib/permissions';
import { logAudit } from '../../../../../../src/lib/audit';

export const runtime = 'nodejs';
function err(status: number, code: string, message?: string) { return NextResponse.json({ error: message || code, code }, { status }); }

interface Params { params: { id: string } }

// POST { userId } to assign role to user
// DELETE { userId } to remove role from user

export async function POST(req: Request, { params }: Params) {
  try {
    await requirePermission('role:update');
    const body = await req.json();
    const userId = String(body.userId||'');
    if (!userId) return err(400,'USER_REQUIRED');
    const role = await prisma.roleEntity.findUnique({ where: { id: params.id } });
    if (!role) return err(404,'NOT_FOUND');
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId, roleId: role.id } },
      update: {},
      create: { userId, roleId: role.id }
    });
    invalidatePermissions(userId);
    logAudit('role.assign','Role', role.id, { userId });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof Error) {
      if (e.message === 'UNAUTHENTICATED') return err(401,'UNAUTHENTICATED');
      if (e.message === 'FORBIDDEN') return err(403,'FORBIDDEN');
    }
    return err(500,'SERVER_ERROR');
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    await requirePermission('role:update');
    const body = await req.json().catch(()=>({}));
    const userId = String(body.userId||'');
    if (!userId) return err(400,'USER_REQUIRED');
    const role = await prisma.roleEntity.findUnique({ where: { id: params.id } });
    if (!role) return err(404,'NOT_FOUND');
    await prisma.userRole.deleteMany({ where: { userId, roleId: role.id } });
    invalidatePermissions(userId);
    logAudit('role.revoke','Role', role.id, { userId });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof Error) {
      if (e.message === 'UNAUTHENTICATED') return err(401,'UNAUTHENTICATED');
      if (e.message === 'FORBIDDEN') return err(403,'FORBIDDEN');
    }
    return err(500,'SERVER_ERROR');
  }
}
