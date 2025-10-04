import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-server';
import AdminProductForm from '../../../../components/AdminProductForm';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return <p className="text-sm text-red-600">No autorizado.</p>;
  const categories = await prisma.category.findMany({ where: { active: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } });
  return (
    <div className="max-w-5xl">
      <AdminProductForm mode="create" categories={categories} />
    </div>
  );
}
