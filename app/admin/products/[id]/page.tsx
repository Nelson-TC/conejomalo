"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Category { id: string; name: string; }
interface Product { id: string; name: string; price: number; description: string | null; categoryId: string; }

export default function EditProductPage() {
	const params = useParams();
	const id = (params as any).id as string;
	const router = useRouter();
	const [categories, setCategories] = useState<Category[]>([]);
	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function load() {
			try {
				const [catsRes, prodRes] = await Promise.all([
					fetch('/api/categories'),
					fetch(`/api/admin/products/${id}`)
				]);
				const cats = await catsRes.json();
				setCategories(cats);
				if (prodRes.ok) {
					const prod = await prodRes.json();
						setProduct(prod);
				}
			} catch (e: any) { setError(e.message); } finally { setLoading(false); }
		}
		load();
	}, [id]);

	async function onSave(e: React.FormEvent) {
		e.preventDefault();
		if (!product) return;
		setSaving(true); setError(null);
		try {
			const res = await fetch(`/api/admin/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: product.name, price: product.price, description: product.description, categoryId: product.categoryId }) });
			if (!res.ok) throw new Error('Error al guardar');
			router.push('/admin/products');
		} catch (e: any) { setError(e.message); } finally { setSaving(false); }
	}

	async function onDelete() {
		if (!confirm('Eliminar producto?')) return;
		try {
			const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error('Error');
			router.push('/admin/products');
		} catch (e: any) { setError(e.message); }
	}

	if (loading) return <p>Cargando...</p>;
	if (!product) return <p>No encontrado</p>;

	return (
		<div className="max-w-xl space-y-6">
			<h1 className="text-2xl font-bold">Editar producto</h1>
			<form onSubmit={onSave} className="space-y-4">
				<input className="w-full px-3 py-2 border rounded" value={product.name} onChange={e=>setProduct({ ...product, name: e.target.value })} />
				<div className="flex gap-4">
					<input className="w-full px-3 py-2 border rounded" type="number" step="0.01" value={product.price} onChange={e=>setProduct({ ...product, price: parseFloat(e.target.value) })} />
					<select className="w-full px-3 py-2 border rounded" value={product.categoryId} onChange={e=>setProduct({ ...product, categoryId: e.target.value })}>
						{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
					</select>
				</div>
				<textarea className="w-full px-3 py-2 border rounded" rows={5} value={product.description ?? ''} onChange={e=>setProduct({ ...product, description: e.target.value })} />
				{error && <p className="text-sm text-red-600">{error}</p>}
				<div className="flex gap-3">
					<button disabled={saving} className="px-4 py-2 text-sm font-medium text-white rounded bg-brand">{saving?'Guardando...':'Guardar'}</button>
					<button type="button" onClick={onDelete} className="text-sm text-red-600">Eliminar</button>
					<button type="button" onClick={()=>router.back()} className="text-sm">Cancelar</button>
				</div>
			</form>
		</div>
	);
}
