import { redirect } from 'next/navigation';
import { getSession } from '../../src/lib/auth';
import LogoutButton from './logout-button';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
	const session = await getSession();
	if (!session) redirect('/login');
	return (
		<div className="container-app py-10 space-y-6">
			<div className="space-y-2">
				<h1 className="text-2xl font-bold">Mi cuenta</h1>
				<p className="text-sm text-neutral-600">Sesión iniciada como <strong>{session.email}</strong> (rol {session.role}).</p>
			</div>
			<LogoutButton />
		</div>
	);
}
