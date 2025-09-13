import Link from 'next/link';
import { prisma } from '../../../src/lib/prisma';

export const dynamic = 'force-dynamic';

async function getCategories() {
	try {
		return await prisma.category.findMany({ orderBy: { createdAt: 'desc' } });
	} catch {
		return [];
	}
}

export default async function AdminCategoriesPage() {
	const categories = await getCategories();
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Categorías</h1>
				<Link href="/admin/categories/new" className="px-4 py-2 text-sm font-medium text-white rounded bg-brand">Nueva</Link>
			</div>
			<table className="w-full text-sm border divide-y">
				<thead className="bg-neutral-50">
					<tr>
						<th className="p-2 text-left">Nombre</th>
						<th className="p-2 text-left">Activa</th>
						<th className="p-2 text-left">Creada</th>
						<th className="p-2" />
					</tr>
				</thead>
				<tbody>
					{categories.map((c: any) => (
						<tr key={c.id} className="hover:bg-neutral-50">
							<td className="p-2 font-medium">{c.name}</td>
							<td className="p-2">{c.active ? 'Sí' : 'No'}</td>
							<td className="p-2">{new Date(c.createdAt).toLocaleDateString()}</td>
							<td className="p-2 text-right">
								<Link href={`/admin/categories/${c.id}`} className="text-brand hover:underline">Editar</Link>
							</td>
						</tr>
					))}
					{categories.length === 0 && (
						<tr><td colSpan={4} className="p-4 text-center text-neutral-500">Sin categorías</td></tr>
					)}
				</tbody>
			</table>
		</div>
	);
}
