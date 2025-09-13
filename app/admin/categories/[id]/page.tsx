"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Category { id: string; name: string; active: boolean; }

export default function EditCategoryPage() {
		const params = useParams();
		const id = (params as any).id as string;
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [category, setCategory] = useState<Category | null>(null);

	useEffect(() => {
		async function load() {
			try {
				const res = await fetch(`/api/admin/categories/${id}`);
				if (!res.ok) throw new Error('No encontrada');
				const data = await res.json();
				setCategory(data);
			} catch (e: any) { setError(e.message); } finally { setLoading(false); }
		}
		load();
	}, [id]);

	async function onSave(e: React.FormEvent) {
		e.preventDefault();
		if (!category) return;
		setSaving(true); setError(null);
		try {
			const res = await fetch(`/api/admin/categories/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: category.name, active: category.active }) });
			if (!res.ok) throw new Error('Error al guardar');
			router.push('/admin/categories');
		} catch (e: any) { setError(e.message); } finally { setSaving(false); }
	}

	async function onDelete() {
		if (!confirm('Eliminar categoría?')) return;
		try {
			const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error('Error');
			router.push('/admin/categories');
		} catch (e: any) { setError(e.message); }
	}

	if (loading) return <p>Cargando...</p>;
	if (error) return <p className="text-red-600">{error}</p>;
	if (!category) return <p>No encontrada</p>;

	return (
		<div className="max-w-md space-y-6">
			<h1 className="text-2xl font-bold">Editar categoría</h1>
			<form onSubmit={onSave} className="space-y-4">
				<input className="w-full px-3 py-2 border rounded" value={category.name} onChange={e=>setCategory({ ...category, name: e.target.value })} />
				<label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={category.active} onChange={e=>setCategory({ ...category, active: e.target.checked })} /> Activa</label>
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
