import { getCurrentUser } from '@/lib/auth-server';
import AdminCategoryForm from '../../../../components/AdminCategoryForm';

export const dynamic = 'force-dynamic';

export default async function NewCategoryPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return <p className="text-sm text-red-600">No autorizado.</p>;
  return (
    <div className="max-w-4xl">
      <AdminCategoryForm mode="create" />
    </div>
  );
}
