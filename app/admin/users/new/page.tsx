import { getCurrentUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import AdminUserForm from '../../../../components/AdminUserForm';

export const dynamic = 'force-dynamic';

export default async function NewUserPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return <p className="text-sm text-red-600">No autorizado.</p>;
  const roles = await prisma.roleEntity.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, label: true } });
  return (
    <div className="max-w-3xl">
      <AdminUserForm mode="create" roles={roles} initialRoleIds={[]} />
    </div>
  );
}
