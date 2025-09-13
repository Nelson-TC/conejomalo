import Link from 'next/link';
import { prisma } from '../../../src/lib/prisma';

export const dynamic = 'force-dynamic';

async function getUsers() {
	try { return await prisma.user.findMany({ orderBy: { createdAt: 'desc' } }); } catch { return []; }
}

export default async function AdminUsersPage() {
	const users = await getUsers();
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Usuarios</h1>
				<Link href="/admin/users/new" className="px-4 py-2 text-sm font-medium text-white rounded bg-brand">Nuevo</Link>
			</div>
			<table className="w-full text-sm border divide-y">
				<thead className="bg-neutral-50">
					<tr>
						<th className="p-2 text-left">Email</th>
						<th className="p-2 text-left">Nombre</th>
						<th className="p-2 text-left">Creado</th>
						<th className="p-2" />
					</tr>
				</thead>
				<tbody>
					{users.map((u: any) => (
						<tr key={u.id} className="hover:bg-neutral-50">
							<td className="p-2 font-medium">{u.email}</td>
							<td className="p-2">{u.name}</td>
							<td className="p-2">{new Date(u.createdAt).toLocaleDateString()}</td>
							<td className="p-2 text-right"><Link href={`/admin/users/${u.id}`} className="text-brand hover:underline">Editar</Link></td>
						</tr>
					))}
					{users.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-neutral-500">Sin usuarios</td></tr>}
				</tbody>
			</table>
		</div>
	);
}
