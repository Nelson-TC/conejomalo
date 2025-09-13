"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewCategoryPage() {
	const router = useRouter();
	const [name, setName] = useState('');
	const [active, setActive] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true); setError(null);
		try {
			const res = await fetch('/api/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, active }) });
			if (!res.ok) throw new Error('Error');
			router.push('/admin/categories');
		} catch (e: any) { setError(e.message); } finally { setLoading(false); }
	}

	return (
		<div className="max-w-md space-y-6">
			<h1 className="text-2xl font-bold">Nueva categoría</h1>
			<form onSubmit={onSubmit} className="space-y-4">
				<input className="w-full px-3 py-2 border rounded" placeholder="Nombre" value={name} onChange={e=>setName(e.target.value)} required />
				<label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={active} onChange={e=>setActive(e.target.checked)} /> Activa</label>
				{error && <p className="text-sm text-red-600">{error}</p>}
				<div className="flex gap-3">
					<button disabled={loading} className="px-4 py-2 text-sm font-medium text-white rounded bg-brand">{loading?'Guardando...':'Guardar'}</button>
					<button type="button" onClick={()=>router.back()} className="text-sm">Cancelar</button>
				</div>
			</form>
		</div>
	);
}
