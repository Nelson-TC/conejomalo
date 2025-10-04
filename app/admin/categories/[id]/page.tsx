import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-server';
import AdminCategoryForm from '../../../../components/AdminCategoryForm';

interface Props { params: { id: string } }

export const dynamic = 'force-dynamic';

export default async function EditCategoryPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return <p className="text-sm text-red-600">No autorizado.</p>;
  const category = await prisma.category.findUnique({ where: { id: params.id } });
  if (!category) return <p className="text-sm text-neutral-600">Categoría no encontrada.</p>;
  const initial = { ...category, imageUrl: category.imageUrl ?? undefined } as any;
  return (
    <div className="max-w-4xl">
      <AdminCategoryForm mode="edit" initial={initial} />
    </div>
  );
}
