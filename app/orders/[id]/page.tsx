import { prisma } from '@/lib/prisma';
import Link from 'next/link';

interface Props { params: { id: string } }

export default async function OrderDetail({ params }: Props) {
		// @ts-ignore prisma types stale
		const order = await prisma.order.findUnique({
		where: { id: params.id },
		include: { items: true }
	});
	if (!order) return <div className="space-y-4"><h1 className="text-2xl font-bold">Pedido</h1><p className="text-sm">No encontrado.</p></div>;
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Pedido #{order.id.slice(0,8)}</h1>
				<Link href="/" className="text-sm text-brand hover:underline">Volver a tienda</Link>
			</div>
			<div className="grid gap-6 md:grid-cols-3">
				<div className="md:col-span-2 space-y-4">
					<h2 className="font-semibold">Items</h2>
					<ul className="divide-y rounded border bg-white">
						{order.items.map((it: any) => (
							<li key={it.id} className="flex items-center justify-between px-4 py-3 text-sm">
								<div>
									<div className="font-medium">{it.name}</div>
									<div className="text-xs text-neutral-500">{it.quantity} x {Number(it.unitPrice).toFixed(2)}</div>
								</div>
								<div className="font-semibold">{(Number(it.unitPrice)*it.quantity).toFixed(2)}</div>
							</li>
						))}
					</ul>
				</div>
				<div className="space-y-4">
					<h2 className="font-semibold">Resumen</h2>
					<div className="space-y-2 text-sm bg-white rounded border p-4">
						<p><span className="text-neutral-500">Cliente:</span> {order.customer}</p>
						<p><span className="text-neutral-500">Email:</span> {order.email}</p>
						<p><span className="text-neutral-500">Teléfono:</span> {order.phone}</p>
						<p><span className="text-neutral-500">Dirección:</span> {order.address}</p>
						<p><span className="text-neutral-500">Subtotal:</span> {Number(order.subtotal).toFixed(2)}</p>
						<p className="font-semibold"><span className="text-neutral-500 font-normal">Total:</span> {Number(order.total).toFixed(2)}</p>
						<p className="text-xs text-neutral-400">Creado: {order.createdAt.toISOString().slice(0,16).replace('T',' ')}</p>
					</div>
				</div>
			</div>
		</div>
	);
}
