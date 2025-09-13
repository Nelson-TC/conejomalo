import Link from 'next/link';
import '../globals.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-neutral-100">
			<header className="bg-white border-b">
				<div className="flex items-center justify-between h-14 container-app">
					<div className="flex items-center gap-6 text-sm font-medium">
						<Link href="/" className="font-semibold">ConejoMalo</Link>
						<Link href="/admin/categories" className="hover:text-brand">Categorías</Link>
						<Link href="/admin/products" className="hover:text-brand">Productos</Link>
						<Link href="/admin/orders" className="hover:text-brand">Pedidos</Link>
						<Link href="/admin/users" className="hover:text-brand">Usuarios</Link>
					</div>
				</div>
			</header>
			<main className="container-app py-8 space-y-8">
				{children}
			</main>
		</div>
	);
}
