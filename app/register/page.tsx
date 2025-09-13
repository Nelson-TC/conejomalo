"use client";
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';

export default function RegisterPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [name, setName] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();
	const { refresh } = useAuth();

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, name }) });
			const data = await res.json();
			if (!res.ok) throw new Error(data?.error || 'Error');
			await refresh();
			router.replace('/account');
		} catch (err: any) {
			setError(err.message || 'No se pudo registrar');
		} finally { setLoading(false); }
	}

	return (
		<div className="flex items-center justify-center w-full px-4 py-12">
			<div className="w-full max-w-sm">
				<div className="mb-8 text-center">
					<h1 className="mb-2 text-2xl font-bold tracking-tight">Crear cuenta</h1>
					<p className="text-sm text-neutral-500">Regístrate para empezar a comprar.</p>
				</div>
				<form onSubmit={onSubmit} className="p-6 space-y-5 bg-white border rounded-2xl shadow-sm">
					<div className="space-y-2">
						<label className="text-xs font-medium text-neutral-600 tracking-wide">Nombre</label>
						<input className="w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/30" placeholder="Tu nombre" value={name} onChange={e => setName(e.target.value)} />
					</div>
					<div className="space-y-2">
						<label className="text-xs font-medium text-neutral-600 tracking-wide">Email</label>
						<input className="w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/30" placeholder="tu@correo.com" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
					</div>
					<div className="space-y-2">
						<label className="text-xs font-medium text-neutral-600 tracking-wide">Contraseña</label>
						<input className="w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/30" placeholder="••••••••" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
					</div>
					{error && <p className="text-sm text-red-600">{error}</p>}
					<button className="w-full px-4 py-2 text-sm font-medium text-white rounded-md bg-brand hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition" disabled={loading}>{loading ? 'Creando…' : 'Crear cuenta'}</button>
					<p className="pt-2 text-xs text-center text-neutral-500">¿Ya tienes cuenta? <a href="/login" className="font-medium text-brand hover:underline">Iniciar sesión</a></p>
				</form>
			</div>
		</div>
	);
}
