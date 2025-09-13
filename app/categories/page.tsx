import Link from 'next/link';
import { prisma } from '../../src/lib/prisma';

export const dynamic = 'force-dynamic';

async function getCategories() {
	try { return await prisma.category.findMany({ orderBy: { name: 'asc' } }); } catch { return []; }
}

export default async function CategoriesIndexPage() {
	const categories = await getCategories();
	return (
		<div className="space-y-8">
			<h1 className="text-3xl font-bold">Categorías</h1>
			<div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{categories.map(c => (
					<Link key={c.id} href={`/categories/${c.slug}`} className="p-4 space-y-2 bg-white border rounded hover:border-brand">
						<h2 className="font-semibold">{c.name}</h2>
					</Link>
				))}
				{categories.length === 0 && <p className="col-span-full text-sm text-neutral-600">Sin categorías.</p>}
			</div>
		</div>
	);
}
