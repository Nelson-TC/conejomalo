import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-server';
import Link from 'next/link';
import { formatCurrency } from '@/lib/format';

interface Props { params: { id: string }; }

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({ params }: Props) {
	const current = await getCurrentUser();
	if (!current || current.role !== 'ADMIN') {
		return <p className="text-sm text-red-600">No autorizado.</p>;
	}
	const order = await prisma.order.findUnique({
		where: { id: params.id },
		include: { items: true, user: { select: { id: true, email: true } } }
	});
	if (!order) return <p className="text-sm text-neutral-600">Pedido no encontrado.</p>;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-4">
				<h1 className="text-2xl font-bold">Pedido</h1>
				<Link href="/admin/orders" className="text-sm text-brand hover:underline">Volver</Link>
			</div>
			<div className="grid gap-6 md:grid-cols-2">
				<div className="p-4 space-y-3 bg-white border rounded-md shadow-sm">
					<h2 className="text-sm font-semibold tracking-wide uppercase text-neutral-500">Resumen</h2>
					<dl className="grid grid-cols-3 gap-2 text-sm">
						<dt className="text-neutral-500">ID</dt>
						<dd className="col-span-2 font-mono break-all">{order.id}</dd>
						<dt className="text-neutral-500">Cliente</dt>
						<dd className="col-span-2">{order.customer}</dd>
						<dt className="text-neutral-500">Email</dt>
						<dd className="col-span-2 break-all">{order.email}</dd>
						<dt className="text-neutral-500">Teléfono</dt>
						<dd className="col-span-2">{order.phone}</dd>
						<dt className="text-neutral-500">Dirección</dt>
						<dd className="col-span-2 whitespace-pre-line">{order.address}</dd>
						<dt className="text-neutral-500">Subtotal</dt>
						<dd className="col-span-2">{formatCurrency(Number(order.subtotal))}</dd>
						<dt className="text-neutral-500">Total</dt>
						<dd className="col-span-2 font-medium">{formatCurrency(Number(order.total))}</dd>
						<dt className="text-neutral-500">Fecha</dt>
						<dd className="col-span-2 text-xs">{order.createdAt.toISOString().slice(0,16).replace('T',' ')}</dd>
						{order.user && (
							<>
								<dt className="text-neutral-500">Usuario</dt>
								<dd className="col-span-2 text-xs">{order.user.email}</dd>
							</>
						)}
					</dl>
				</div>
				<div className="p-4 space-y-3 bg-white border rounded-md shadow-sm">
					<h2 className="text-sm font-semibold tracking-wide uppercase text-neutral-500">Items ({order.items.length})</h2>
					<div className="overflow-auto border rounded-md max-h-96 border-neutral-200">
						<table className="w-full text-sm min-w-[500px]">
							<thead className="text-[11px] uppercase tracking-wide bg-neutral-50 text-neutral-500">
								<tr>
									<th className="px-3 py-2 text-left">Producto</th>
									<th className="px-3 py-2 text-left">Slug</th>
									<th className="px-3 py-2 text-right">Cant</th>
									<th className="px-3 py-2 text-right">Unit</th>
									<th className="px-3 py-2 text-right">Importe</th>
								</tr>
							</thead>
							<tbody className="divide-y">
								{order.items.map(i => {
									const unit = Number(i.unitPrice);
									return (
										<tr key={i.id} className="hover:bg-neutral-50">
											<td className="px-3 py-2">{i.name}</td>
											<td className="px-3 py-2 text-xs text-neutral-500">{i.slug}</td>
											<td className="px-3 py-2 text-right">{i.quantity}</td>
											  <td className="px-3 py-2 text-right">{formatCurrency(unit)}</td>
											  <td className="px-3 py-2 text-right font-medium">{formatCurrency(unit * i.quantity)}</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}
