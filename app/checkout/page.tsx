import CheckoutForm from '../../components/CheckoutForm';
import { formatCurrency } from '../../src/lib/format';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
	const raw = cookies().get('cart')?.value;
	let items: { productId: string; qty: number }[] = [];
	try { if (raw) { const parsed = JSON.parse(raw); if (Array.isArray(parsed.items)) items = parsed.items; } } catch {}
	if (items.length) {
		const products = await prisma.product.findMany({ where: { id: { in: items.map(i=>i.productId) } }, select: { id:true, name:true, price:true } });
		const map = new Map(products.map((p: any)=>[p.id,p]));
		const enriched = items.filter(i=>map.has(i.productId)).map(i=>{ const p: any = map.get(i.productId)!; const price = Number(p.price); return { ...i, name: p.name, price, lineTotal: price * i.qty }; });
		const subtotal = enriched.reduce((s,i)=>s+i.lineTotal,0);
		return (
			<div className="max-w-4xl space-y-8">
				<h1 className="text-3xl font-bold">Checkout</h1>
				{enriched.length === 0 && <p className="text-sm text-neutral-600">Carrito vacío.</p>}
				{enriched.length > 0 && (
					<div className="grid gap-8 md:grid-cols-3">
						<div className="space-y-4 md:col-span-2">
							<h2 className="text-xl font-semibold">Resumen</h2>
							<div className="space-y-3">
								{enriched.map((i: any) => (
									<div key={i.productId} className="flex justify-between text-sm">
										<span>{i.name} x {i.qty}</span>
										<span>{formatCurrency(i.lineTotal)}</span>
									</div>
								))}
								<div className="flex justify-between pt-2 font-semibold border-t">
									<span>Subtotal</span>
									<span>{formatCurrency(subtotal)}</span>
								</div>
							</div>
						</div>
						<div>
							<CheckoutForm subtotal={subtotal} />
						</div>
					</div>
				)}
			</div>
		);
	}
	return (
		<div className="max-w-4xl space-y-8">
			<h1 className="text-3xl font-bold">Checkout</h1>
			<p className="text-sm text-neutral-600">Carrito vacío.</p>
		</div>
	);
}
