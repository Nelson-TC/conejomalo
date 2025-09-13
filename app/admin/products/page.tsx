import Link from 'next/link';
import { prisma } from '../../../src/lib/prisma';

export const dynamic = 'force-dynamic';

async function getProducts() {
	try {
		return await prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' } });
	} catch { return []; }
}

export default async function AdminProductsPage() {
	const products = await getProducts();
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Productos</h1>
				<Link href="/admin/products/new" className="px-4 py-2 text-sm font-medium text-white rounded bg-brand">Nuevo</Link>
			</div>
			<table className="w-full text-sm border divide-y">
				<thead className="bg-neutral-50">
					<tr>
						<th className="p-2 text-left">Nombre</th>
						<th className="p-2 text-left">Categoría</th>
						<th className="p-2 text-left">Precio</th>
						<th className="p-2 text-left">Creado</th>
						<th className="p-2" />
					</tr>
				</thead>
				<tbody>
					{products.map((p: any) => (
						<tr key={p.id} className="hover:bg-neutral-50">
							<td className="p-2 font-medium">{p.name}</td>
							<td className="p-2">{p.category?.name}</td>
							<td className="p-2">Q{p.price?.toString?.() ?? p.price}</td>
							<td className="p-2">{new Date(p.createdAt).toLocaleDateString()}</td>
							<td className="p-2 text-right"><Link href={`/admin/products/${p.id}`} className="text-brand hover:underline">Editar</Link></td>
						</tr>
					))}
					{products.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-neutral-500">Sin productos</td></tr>}
				</tbody>
			</table>
		</div>
	);
}
