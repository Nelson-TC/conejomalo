import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-server';
import { formatCurrency } from '@/lib/format';

interface SearchParams { page?: string; q?: string; }

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
	// Autorización básica: sólo ADMIN puede ver
	const current = await getCurrentUser();
	if (!current || current.role !== 'ADMIN') {
		return <p className="text-sm text-red-600">No autorizado.</p>;
	}

	const pageSize = 20;
	const page = Math.max(parseInt(searchParams.page || '1', 10) || 1, 1);
	const q = (searchParams.q || '').trim();
	const where: any = q ? {
		OR: [
			{ id: { contains: q } },
			{ customer: { contains: q, mode: 'insensitive' } },
			{ email: { contains: q, mode: 'insensitive' } }
		]
	} : {};

	const [totalCount, orders] = await Promise.all([
		prisma.order.count({ where }),
		prisma.order.findMany({
			where,
			orderBy: { createdAt: 'desc' },
			skip: (page - 1) * pageSize,
			take: pageSize,
			select: {
				id: true,
				customer: true,
				email: true,
				subtotal: true,
				total: true,
				createdAt: true,
				items: { select: { id: true } }
			}
		})
	]);

	const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="text-2xl font-bold">Pedidos</h1>
				<form className="flex gap-2">
					<input
						name="q"
						defaultValue={q}
						placeholder="Buscar id, cliente o email..."
						className="px-3 py-2 text-sm border rounded-md w-72 border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand/40"
					/>
					<button className="px-4 py-2 text-sm font-medium text-white rounded-md bg-brand hover:bg-brand-dark">Buscar</button>
				</form>
			</div>

			{orders.length === 0 && (
				<p className="text-sm text-neutral-600">No hay pedidos {q && <>para la búsqueda "{q}"</>}.</p>
			)}

			{orders.length > 0 && (
				<div className="overflow-auto border rounded-md bg-white border-neutral-200 shadow-sm">
					<table className="w-full text-sm text-left align-middle min-w-[800px]">
						<thead className="text-[11px] uppercase tracking-wide bg-neutral-50 text-neutral-500">
							<tr>
								<th className="px-3 py-2 font-medium">ID</th>
								<th className="px-3 py-2 font-medium">Cliente</th>
								<th className="px-3 py-2 font-medium">Email</th>
								<th className="px-3 py-2 font-medium text-right">Items</th>
								<th className="px-3 py-2 font-medium text-right">Subtotal</th>
								<th className="px-3 py-2 font-medium text-right">Total</th>
								<th className="px-3 py-2 font-medium">Fecha</th>
								<th className="px-3 py-2"></th>
							</tr>
						</thead>
						<tbody className="divide-y">
							{orders.map(o => {
								const itemsCount = o.items.length;
								return (
									<tr key={o.id} className="hover:bg-neutral-50">
										<td className="px-3 py-2 font-mono text-xs truncate max-w-[140px]" title={o.id}>{o.id}</td>
										<td className="px-3 py-2">{o.customer}</td>
										<td className="px-3 py-2 text-neutral-600">{o.email}</td>
										<td className="px-3 py-2 text-right">{itemsCount}</td>
										<td className="px-3 py-2 text-right">{formatCurrency(Number(o.subtotal))}</td>
										<td className="px-3 py-2 text-right font-medium">{formatCurrency(Number(o.total))}</td>
										<td className="px-3 py-2 text-xs whitespace-nowrap">{o.createdAt.toISOString().slice(0,16).replace('T',' ')}</td>
										<td className="px-3 py-2 text-right"><Link href={`/admin/orders/${o.id}`} className="text-brand hover:underline">Ver</Link></td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}

			{totalPages > 1 && (
				<div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
					{Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
						const active = p === page;
						const params = new URLSearchParams();
						if (q) params.set('q', q);
						if (p !== 1) params.set('page', String(p));
						const href = params.toString() ? `?${params.toString()}` : '';
						return (
							<Link
								key={p}
								href={href}
								className={`px-3 py-1 rounded border ${active ? 'bg-brand text-white border-brand' : 'border-neutral-300 hover:bg-neutral-100'}`}
							>{p}</Link>
						);
					})}
				</div>
			)}
		</div>
	);
}
