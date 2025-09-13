"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewUserPage() {
	const router = useRouter();
	const [form, setForm] = useState({ email: '', name: '' });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) { setForm(f => ({ ...f, [key]: value })); }

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault(); setLoading(true); setError(null);
		try {
			const res = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
			if (!res.ok) throw new Error('Error');
			router.push('/admin/users');
		} catch (e: any) { setError(e.message); } finally { setLoading(false); }
	}

	return (
		<div className="max-w-md space-y-6">
			<h1 className="text-2xl font-bold">Nuevo usuario</h1>
			<form onSubmit={onSubmit} className="space-y-4">
				<input className="w-full px-3 py-2 border rounded" placeholder="Email" value={form.email} onChange={e=>update('email', e.target.value)} required />
				<input className="w-full px-3 py-2 border rounded" placeholder="Nombre" value={form.name} onChange={e=>update('name', e.target.value)} />
				{error && <p className="text-sm text-red-600">{error}</p>}
				<div className="flex gap-3">
					<button disabled={loading} className="px-4 py-2 text-sm font-medium text-white rounded bg-brand">{loading?'Guardando...':'Guardar'}</button>
					<button type="button" onClick={()=>router.back()} className="text-sm">Cancelar</button>
				</div>
			</form>
		</div>
	);
}
