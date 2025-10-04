import { redirect } from 'next/navigation';
import { getSession } from '../../src/lib/auth';
import LogoutButton from './logout-button';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/format';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
	const session = await getSession();
	if (!session) redirect('/login');
	const userId = session.sub;
	const orders = await prisma.order.findMany({
		where: { userId },
		orderBy: { createdAt: 'desc' },
		include: { items: true }
	});

	// Métricas simples
	const totalOrders = orders.length;
	const totalSpent = orders.reduce((s,o)=> s + Number(o.total), 0);
	const totalItems = orders.reduce((s,o)=> s + o.items.reduce((x,i)=> x + i.quantity, 0), 0);
	const lastOrderDate = orders[0]?.createdAt;

	return (
		<div className="max-w-6xl py-10 mx-auto space-y-10">
			<Header email={session.email} role={session.role} />
			<div className="grid gap-6 lg:grid-cols-3">
				<div className="space-y-6 lg:col-span-2">
					<OrdersSection orders={orders} />
					<StatsBar metrics={{ totalOrders, totalSpent, totalItems, lastOrderDate }} />
				</div>
				<aside className="space-y-6 lg:sticky lg:top-24 h-max">
					<ProfileCard email={session.email} role={session.role} />
					<HelpCard />
				</aside>
			</div>
		</div>
	);
}

function Header({ email, role }: { email: string; role: string }) {
	return (
		<header className="space-y-2">
			<h1 className="text-3xl font-bold tracking-tight">Mi cuenta</h1>
			<p className="text-sm text-neutral-600">Sesión iniciada como <strong>{email}</strong> (rol {role}).</p>
		</header>
	);
}

function OrdersSection({ orders }: { orders: any[] }) {
	if (orders.length === 0) {
		return (
			<section className="space-y-3">
				<SectionHeader title="Mis pedidos" count={0} />
				<div className="p-6 text-sm text-center border rounded-lg bg-surface text-neutral-500">Aún no has realizado pedidos.
					<div className="mt-4">
						<Link href="/products" className="inline-block px-4 py-2 text-xs font-semibold rounded bg-carrot text-nav hover:bg-carrot-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nav">Explorar productos</Link>
					</div>
				</div>
			</section>
		);
	}
	return (
		<section className="space-y-4">
			<SectionHeader title="Mis pedidos" count={orders.length} />
			<div className="overflow-hidden border rounded-lg shadow-sm bg-surface">
				<ul className="divide-y">
					{orders.map(o => {
						const itemsCount = o.items.reduce((s: number,i: any)=> s + i.quantity, 0);
						const smallId = o.id.slice(0,8);
						return (
							<li key={o.id} className="flex flex-col gap-3 p-4 text-sm md:flex-row md:items-center md:gap-6">
								<div className="flex-1 min-w-0 space-y-1">
									<div className="font-medium text-nav">Pedido #{smallId}</div>
									<div className="text-[11px] text-neutral-500 flex flex-wrap gap-x-3 gap-y-1">
										<span>{o.createdAt.toISOString().slice(0,10)}</span>
										<span>{itemsCount} {itemsCount === 1 ? 'item' : 'items'}</span>
									</div>
								</div>
								<div className="flex items-center gap-6">
									<div className="font-semibold tabular-nums text-neutral-700">{formatCurrency(Number(o.total))}</div>
									<Link href={`/orders/${o.id}`} className="px-3 py-1 text-xs font-medium border rounded border-neutral-300 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-carrot">Ver detalle</Link>
								</div>
							</li>
						);
					})}
				</ul>
			</div>
		</section>
	);
}

function ProfileCard({ email, role }: { email: string; role: string }) {
	return (
		<div className="p-5 space-y-4 border rounded-lg shadow-sm bg-surface">
			<div className="flex items-center gap-3">
				<div className="flex items-center justify-center w-12 h-12 text-lg font-semibold rounded-full bg-nav text-carrot">
					{email.charAt(0).toUpperCase()}
				</div>
				<div>
					<p className="text-sm font-medium text-neutral-800">{email}</p>
					<p className="text-xs tracking-wide uppercase text-neutral-500">{role}</p>
				</div>
			</div>
			<LogoutButton />
			<div className="pt-2 border-t">
				<ul className="text-[11px] space-y-1 text-neutral-600">
					<li><span className="font-medium text-neutral-700">Privacidad:</span> Nunca compartimos tu correo.</li>
					<li><span className="font-medium text-neutral-700">Soporte:</span> <Link href="/contact" className="text-carrot hover:underline">Contacto</Link></li>
				</ul>
			</div>
		</div>
	);
}


function StatsBar({ metrics }: { metrics: { totalOrders: number; totalSpent: number; totalItems: number; lastOrderDate?: Date } }) {
	const cards = [
		{ label: 'Pedidos', value: metrics.totalOrders, sub: metrics.totalOrders ? 'Totales' : 'Sin pedidos' },
		{ label: 'Artículos', value: metrics.totalItems, sub: metrics.totalItems ? 'Acumulados' : 'N/A' },
		{ label: 'Gastado', value: formatCurrency(metrics.totalSpent), sub: metrics.totalOrders ? 'Subtotal acumulado' : 'N/A' },
		{ label: 'Último', value: metrics.lastOrderDate ? metrics.lastOrderDate.toISOString().slice(0,10) : '—', sub: 'Fecha' }
	];
	return (
		<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{cards.map(c => (
				<div key={c.label} className="p-4 border rounded-lg shadow-sm bg-surface">
					<p className="text-[11px] uppercase tracking-wide text-neutral-500 font-medium">{c.label}</p>
						<div className="mt-1 text-lg font-semibold text-nav">{c.value}</div>
						<p className="text-[11px] text-neutral-500">{c.sub}</p>
				</div>
			))}
		</div>
	);
}

function SectionHeader({ title, count }: { title: string; count?: number }) {
	return (
		<div className="flex items-center justify-between">
			<h2 className="text-lg font-semibold text-nav">{title}</h2>
			{typeof count === 'number' && <span className="text-[11px] px-2 py-0.5 rounded-full bg-nav text-surface">{count}</span>}
		</div>
	);
}

function HelpCard() {
	return (
		<div className="p-5 space-y-4 border rounded-lg bg-surface shadow-sm text-[13px] text-neutral-600">
			<p className="font-semibold text-neutral-800">¿Necesitas ayuda?</p>
			<p className="leading-relaxed">Visita la sección de contacto para soporte o preguntas sobre tus pedidos recientes.</p>
			<Link href="/contact" className="inline-block px-4 py-2 text-xs font-semibold rounded bg-carrot text-nav hover:bg-carrot-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nav">Contacto</Link>
		</div>
	);
}
