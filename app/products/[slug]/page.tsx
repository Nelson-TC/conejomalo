import { notFound } from 'next/navigation';
import { prisma } from '../../../src/lib/prisma';
import { formatCurrency } from '../../../src/lib/format';
import AddToCartButton from '../../../components/AddToCartButton';
import Image from 'next/image';

interface Props { params: { slug: string } }

export default async function ProductDetailPage({ params }: Props) {
	const product = await prisma.product.findUnique({ where: { slug: params.slug } });
	if (!product) return notFound();

	const priceNumber = Number(product.price);

	return (
		<div className="max-w-5xl p-6 mx-auto md:py-10">
			<div className="grid gap-10 md:grid-cols-2">
				<div>
					<div className="relative overflow-hidden border rounded-xl bg-neutral-50 aspect-square border-neutral-200">
						{product.imageUrl ? (
							/* eslint-disable @next/next/no-img-element */
							<img
								src={product.imageUrl}
								alt={product.name}
								className="object-cover w-full h-full"
							/>
						) : (
							<div className="flex items-center justify-center w-full h-full text-xs tracking-wider select-none text-neutral-400">SIN IMAGEN</div>
						)}
					</div>
				</div>
				<div className="space-y-6">
					<div className="space-y-3">
						<h1 className="text-3xl font-bold tracking-tight md:text-4xl">{product.name}</h1>
						{product.description && <p className="text-sm leading-relaxed whitespace-pre-line text-neutral-700">{product.description}</p>}
					</div>
					<div className="flex items-center gap-6">
						<div className="text-2xl font-semibold text-brand">{formatCurrency(priceNumber)}</div>
						<AddToCartButton productId={product.id} />
					</div>
				</div>
			</div>
		</div>
	);
}
