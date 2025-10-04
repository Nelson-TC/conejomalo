import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-server';
import AdminUserForm from '../../../../components/AdminUserForm';

interface Props { params: { id: string } }
export const dynamic = 'force-dynamic';

export default async function EditUserPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return <p className="text-sm text-red-600">No autorizado.</p>;
  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target) return <p className="text-sm text-neutral-600">Usuario no encontrado.</p>;
  const initial = { ...target } as any;
  return (
    <div className="max-w-3xl">
      <AdminUserForm mode="edit" initial={initial} />
    </div>
  );
}
