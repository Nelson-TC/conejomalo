import { prisma } from '../../src/lib/prisma';
import ProductCard from '../../components/ProductCard';

export const dynamic = 'force-dynamic';

async function getProducts() {
	try { return await prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' } }); } catch { return []; }
}

export default async function ProductsPage() {
	const products = await getProducts();
	return (
		<div className="space-y-8">
			<h1 className="text-3xl font-bold">Productos</h1>
			<div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{products.map((p: any) => <ProductCard key={p.id} product={p} />)}
				{products.length === 0 && <p className="col-span-full text-sm text-neutral-600">Sin productos.</p>}
			</div>
		</div>
	);
}
