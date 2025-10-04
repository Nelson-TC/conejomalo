import { getCurrentUser } from '@/lib/auth-server';
import AdminUserForm from '../../../../components/AdminUserForm';

export const dynamic = 'force-dynamic';

export default async function NewUserPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return <p className="text-sm text-red-600">No autorizado.</p>;
  return (
    <div className="max-w-3xl">
      <AdminUserForm mode="create" />
    </div>
  );
}
