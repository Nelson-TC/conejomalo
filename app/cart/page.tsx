"use client";
import { useEffect, useState } from 'react';
import { getCart, updateItem, removeItem, CartItem, EnrichedCartItem } from '../../src/lib/cart';
import { formatCurrency } from '../../src/lib/format';

interface Row extends CartItem { name?: string; price?: number; lineTotal?: number }

export default function CartPage() {
	const [items, setItems] = useState<Row[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string|null>(null);

	async function load() {
		try {
			setLoading(true);
			const cart = await getCart();
			if ((cart as any).enriched) {
				const enriched = (cart as any).enriched as EnrichedCartItem[];
				setItems(enriched.map(e => ({ ...e })));
			} else {
				setItems(cart.items.map(i => ({ ...i, name: i.productId })));
			}
		} catch (e: any) { setError(e.message); } finally { setLoading(false); }
	}

	useEffect(() => { load(); }, []);

	async function changeQty(productId: string, qty: number) {
		try {
			await updateItem(productId, qty);
			await load();
		} catch (e: any) { setError(e.message); }
	}

	async function remove(productId: string) {
		try { await removeItem(productId); await load(); } catch (e: any) { setError(e.message); }
	}

	const totalQty = items.reduce((sum, i) => sum + i.qty, 0);
	const subtotal = items.reduce((s, i) => s + (i.lineTotal || 0), 0);

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Carrito</h1>
			{error && <p className="text-sm text-red-600">{error}</p>}
			{loading && <p className="text-sm text-neutral-500">Cargando…</p>}
			{!loading && items.length === 0 && <p className="text-sm text-neutral-600">Carrito vacío.</p>}
			{!loading && items.length > 0 && (
				<div className="space-y-4">
					<table className="w-full text-sm border-collapse">
						<thead>
							<tr className="text-left border-b">
								<th className="py-2 pr-4">Producto</th>
								<th className="py-2 pr-4 w-40">Cantidad</th>
								<th className="py-2 pr-4 w-32">Precio</th>
								<th className="py-2 pr-4 w-32">Subtotal</th>
								<th className="py-2 pr-4" />
							</tr>
						</thead>
						<tbody>
							{items.map(i => (
								<tr key={i.productId} className="border-b last:border-0">
									<td className="py-2 pr-4 font-medium">{i.name}</td>
									<td className="py-2 pr-4">
										<div className="flex items-center gap-1">
											<button aria-label="menos" className="border rounded px-2 py-1" onClick={() => changeQty(i.productId, Math.max(0, i.qty - 1))}>-</button>
											<input
												type="number"
												min={0}
												className="w-16 border rounded px-2 py-1 text-center"
												value={i.qty}
												onChange={e => changeQty(i.productId, parseInt(e.target.value || '0', 10))}
											/>
											<button aria-label="más" className="border rounded px-2 py-1" onClick={() => changeQty(i.productId, i.qty + 1)}>+</button>
										</div>
									</td>
									<td className="py-2 pr-4">{i.price != null ? formatCurrency(i.price) : '-'}</td>
									<td className="py-2 pr-4">{i.lineTotal != null ? formatCurrency(i.lineTotal) : '-'}</td>
									<td className="py-2 pr-4 text-right">
										<button className="text-xs text-red-600" onClick={() => remove(i.productId)}>Eliminar</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
					<div className="text-sm font-semibold flex justify-between">
						<span>Total items: {totalQty}</span>
						<span>Subtotal: {formatCurrency(subtotal)}</span>
					</div>
					<div className="flex justify-end pt-2">
						<a href="/checkout" className="px-5 py-2 text-sm font-medium text-white rounded bg-brand">Ir a Checkout</a>
					</div>
				</div>
			)}
		</div>
	);
}
