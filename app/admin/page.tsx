export default function AdminDashboardPage() {
	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Panel de administración</h1>
			<p className="text-sm text-neutral-600">Usa la navegación superior para gestionar el contenido.</p>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{[
					{ title: 'Categorías', href: '/admin/categories', desc: 'Gestiona las categorías de productos.' },
					{ title: 'Productos', href: '/admin/products', desc: 'Crea y edita productos.' },
					{ title: 'Pedidos', href: '/admin/orders', desc: 'Revisa pedidos (placeholder).' },
					{ title: 'Usuarios', href: '/admin/users', desc: 'Administra usuarios y roles (placeholder).' }
				].map(c => (
					<a key={c.title} href={c.href} className="p-4 space-y-2 bg-white border rounded shadow-sm hover:border-brand">
						<div className="font-semibold">{c.title}</div>
						<div className="text-xs text-neutral-600">{c.desc}</div>
					</a>
				))}
			</div>
		</div>
	);
}
