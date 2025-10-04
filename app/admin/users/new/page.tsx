import { prisma } from '@/lib/prisma';
import AdminUserForm from '../../../../components/AdminUserForm';
import { requirePagePermission } from '@/lib/guard.ts';

export const dynamic = 'force-dynamic';

export default async function NewUserPage() {
  const { user, allowed } = await requirePagePermission(['user:create','user:update']);
  if (!user) return <p className="text-sm text-red-600">No autenticado.</p>;
  if (!allowed) return <p className="text-sm text-red-600">No autorizado.</p>;
  const roles = await prisma.roleEntity.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, label: true } });
  return (
    <div className="max-w-3xl">
      <AdminUserForm mode="create" roles={roles} initialRoleIds={[]} />
    </div>
  );
}
