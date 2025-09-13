"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Category { id: string; name: string; }

export default function NewProductPage() {
	const router = useRouter();
	const [categories, setCategories] = useState<Category[]>([]);
	const [form, setForm] = useState({ name: '', price: '0', categoryId: '', description: '' });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const res = await fetch('/api/categories', { cache: 'no-store' });
				if (!res.ok) return; // silencioso
				const data = await res.json();
				const list: Category[] = Array.isArray(data?.categories) ? data.categories : Array.isArray(data) ? data : [];
				if (cancelled) return;
				setCategories(list);
				if (list.length) setForm(f=>({ ...f, categoryId: list[0].id }));
			} catch {}
		})();
		return () => { cancelled = true; };
	}, []);

	function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) { setForm(f => ({ ...f, [key]: value })); }

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault(); setLoading(true); setError(null);
		try {
			const res = await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, price: parseFloat(form.price) }) });
			if (!res.ok) throw new Error('Error');
			router.push('/admin/products');
		} catch (e: any) { setError(e.message); } finally { setLoading(false); }
	}

	return (
		<div className="max-w-xl space-y-6">
			<h1 className="text-2xl font-bold">Nuevo producto</h1>
			<form onSubmit={onSubmit} className="space-y-4">
				<input className="w-full px-3 py-2 border rounded" placeholder="Nombre" value={form.name} onChange={e=>update('name', e.target.value)} required />
				<div className="flex gap-4">
					<input className="w-full px-3 py-2 border rounded" type="number" step="0.01" placeholder="Precio" value={form.price} onChange={e=>update('price', e.target.value)} required />
					<select className="w-full px-3 py-2 border rounded" value={form.categoryId} onChange={e=>update('categoryId', e.target.value)} disabled={!categories.length}>
						{categories.length === 0 && <option value="">Sin categorías</option>}
						{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
					</select>
				</div>
				<textarea className="w-full px-3 py-2 border rounded" rows={5} placeholder="Descripción" value={form.description} onChange={e=>update('description', e.target.value)} />
				{error && <p className="text-sm text-red-600">{error}</p>}
				<div className="flex gap-3">
					<button disabled={loading} className="px-4 py-2 text-sm font-medium text-white rounded bg-brand">{loading?'Guardando...':'Guardar'}</button>
					<button type="button" onClick={()=>router.back()} className="text-sm">Cancelar</button>
				</div>
			</form>
		</div>
	);
}
