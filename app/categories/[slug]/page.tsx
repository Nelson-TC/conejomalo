import { notFound } from 'next/navigation';
import { prisma } from '../../../src/lib/prisma';
import ProductCard from '../../../components/ProductCard';

interface Props { params: { slug: string } }

async function getData(slug: string) {
	try {
		const category = await prisma.category.findUnique({ where: { slug }, select: { id: true, name: true, slug: true, products: { orderBy: { createdAt: 'desc' } } } });
		return category;
	} catch { return null; }
}

export default async function CategoryPage({ params }: Props) {
	const category = await getData(params.slug);
	if (!category) return notFound();
	const products = category.products;
	return (
		<div className="space-y-8">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold">{category.name}</h1>
				<p className="text-sm text-neutral-600">Productos de la categoría.</p>
			</div>
			<div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{products.map((p: any) => <ProductCard key={p.id} product={p as any} />)}
				{products.length === 0 && <p className="text-sm col-span-full text-neutral-600">Sin productos.</p>}
			</div>
		</div>
	);
}
